import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  AppState
} from 'react-native';

const App = () => {
  // State'ler
  const [solEnerji, setSolEnerji] = useState(50);
  const [sagEnerji, setSagEnerji] = useState(50);
  const [sure, setSure] = useState(0);
  const [oyunBitti, setOyunBitti] = useState(false);
  const [zorlukSeviyesi, setZorlukSeviyesi] = useState(1);
  const [dengeModu, setDengeModu] = useState(false);

  // Oyun kontrol değişkenleri
  const [gameInterval, setGameInterval] = useState(null);
  const [disturbInterval, setDisturbInterval] = useState(null);

  // Enerji değişim miktarı (zorlukla artar)
  const enerjiDegisimMiktari = 2 + Math.floor(zorlukSeviyesi / 2);

  // Oyunu başlat
  const startGame = () => {
    setSolEnerji(50);
    setSagEnerji(50);
    setSure(0);
    setOyunBitti(false);
    setZorlukSeviyesi(1);
    setDengeModu(false);
  };

  // Sol tarafa tıklama
  const handleClickLeft = () => {
    if (oyunBitti) return;
    
    setSolEnerji(prev => {
      const newVal = Math.min(prev + enerjiDegisimMiktari, 100);
      return newVal;
    });
    setSagEnerji(prev => {
      const newVal = Math.max(prev - enerjiDegisimMiktari, 0);
      return newVal;
    });
  };

  // Sağ tarafa tıklama
  const handleClickRight = () => {
    if (oyunBitti) return;
    
    setSagEnerji(prev => {
      const newVal = Math.min(prev + enerjiDegisimMiktari, 100);
      return newVal;
    });
    setSolEnerji(prev => {
      const newVal = Math.max(prev - enerjiDegisimMiktari, 0);
      return newVal;
    });
  };

  // Denge kontrolü
  useEffect(() => {
    const fark = Math.abs(solEnerji - sagEnerji);
    setDengeModu(fark <= 10);
  }, [solEnerji, sagEnerji]);

  // Oyun bitiş kontrolü
  useEffect(() => {
    if (solEnerji <= 0 || sagEnerji <= 0 || solEnerji >= 100 || sagEnerji >= 100) {
      setOyunBitti(true);
    }
  }, [solEnerji, sagEnerji]);

  // Süre ve zorluk artışı
  useEffect(() => {
    if (oyunBitti) return;

    const interval = setInterval(() => {
      setSure(prevSure => {
        const newSure = prevSure + 1;
        
        // Her 10 saniyede zorluk artışı
        if (newSure % 10 === 0) {
          setZorlukSeviyesi(prev => prev + 1);
        }
        
        return newSure;
      });
    }, 1000);

    setGameInterval(interval);

    return () => clearInterval(interval);
  }, [oyunBitti]);

  // Denge bozulması efekti
  useEffect(() => {
    if (oyunBitti) return;

    const disturb = setInterval(() => {
      if (oyunBitti) return;

      const bozulmaMiktari = 3 + Math.floor(zorlukSeviyesi / 3);
      const rastgeleYon = Math.random() > 0.5 ? 1 : -1;

      setSolEnerji(prev => {
        const newVal = prev + (bozulmaMiktari * rastgeleYon);
        return Math.max(0, Math.min(100, newVal));
      });

      setSagEnerji(prev => {
        const newVal = prev - (bozulmaMiktari * rastgeleYon);
        return Math.max(0, Math.min(100, newVal));
      });
    }, 3000);

    setDisturbInterval(disturb);

    return () => clearInterval(disturb);
  }, [oyunBitti, zorlukSeviyesi]);

  // App state değişikliklerini dinle
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // Oyunu duraklat
        if (gameInterval) clearInterval(gameInterval);
        if (disturbInterval) clearInterval(disturbInterval);
      }
    });

    return () => {
      subscription.remove();
      if (gameInterval) clearInterval(gameInterval);
      if (disturbInterval) clearInterval(disturbInterval);
    };
  }, []);

  // Progress bar bileşeni
  const EnergyBar = ({ energy, color, label }) => (
    <View style={styles.energyBarContainer}>
      <Text style={styles.energyLabel}>{label}</Text>
      <View style={styles.energyBarBackground}>
        <View 
          style={[
            styles.energyBarFill,
            { 
              width: `${energy}%`,
              backgroundColor: color
            }
          ]} 
        />
      </View>
      <Text style={styles.energyText}>{Math.round(energy)}%</Text>
    </View>
  );

  return (
    <View style={[
      styles.container,
      dengeModu && styles.dengeModuContainer
    ]}>
      {/* Üst Bilgi */}
      <View style={styles.header}>
        <Text style={styles.title}>Mirror Click</Text>
        <Text style={styles.subtitle}>Yansıma Dünyası</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Süre: {sure}s</Text>
          <Text style={styles.statText}>Zorluk: {zorlukSeviyesi}</Text>
          <Text style={styles.statText}>
            Denge: {dengeModu ? '✓' : '✗'}
          </Text>
        </View>
      </View>

      {/* Enerji Bar'ları */}
      <View style={styles.energyBars}>
        <EnergyBar 
          energy={solEnerji} 
          color="#00BFFF" 
          label="SOL ENERJİ" 
        />
        <EnergyBar 
          energy={sagEnerji} 
          color="#FF1493" 
          label="SAĞ ENERJİ" 
        />
      </View>

      {/* Tıklama Alanları */}
      <View style={styles.clickAreas}>
        <TouchableOpacity 
          style={[styles.clickArea, styles.leftArea]}
          onPress={handleClickLeft}
          activeOpacity={0.7}
        >
          <Text style={styles.clickAreaText}>SOL TARAF</Text>
          <Text style={styles.clickHint}>+{enerjiDegisimMiktari} Sol / -{enerjiDegisimMiktari} Sağ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.clickArea, styles.rightArea]}
          onPress={handleClickRight}
          activeOpacity={0.7}
        >
          <Text style={styles.clickAreaText}>SAĞ TARAF</Text>
          <Text style={styles.clickHint}>+{enerjiDegisimMiktari} Sağ / -{enerjiDegisimMiktari} Sol</Text>
        </TouchableOpacity>
      </View>

      {/* Oyun Sonu Modal'ı */}
      <Modal visible={oyunBitti} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>OYUN BİTTİ!</Text>
            
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                Dayandığın süre: {sure} saniye
              </Text>
              <Text style={styles.resultText}>
                Zorluk seviyesi: {zorlukSeviyesi}
              </Text>
              <Text style={styles.finalEnergyText}>
                Sol Enerji: {Math.round(solEnerji)}%
              </Text>
              <Text style={styles.finalEnergyText}>
                Sağ Enerji: {Math.round(sagEnerji)}%
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.restartButton}
              onPress={startGame}
            >
              <Text style={styles.restartButtonText}>TEKRAR OYNA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Oyun İpuçları */}
      {!oyunBitti && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipText}>
            💡 İpucu: Enerjileri %45-55 arasında dengede tut!
          </Text>
          <Text style={styles.tipText}>
            ⚡ Her {zorlukSeviyesi < 5 ? 3 : 2}s'de denge bozulur
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  dengeModuContainer: {
    backgroundColor: '#2a1a4a',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: '#7A00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  energyBars: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  energyBarContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  energyLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  energyBarBackground: {
    width: '100%',
    height: 30,
    backgroundColor: '#333',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#444',
  },
  energyBarFill: {
    height: '100%',
    borderRadius: 15,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  energyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  clickAreas: {
    flex: 3,
    flexDirection: 'row',
  },
  clickArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
    borderWidth: 3,
  },
  leftArea: {
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    borderColor: '#00BFFF',
  },
  rightArea: {
    backgroundColor: 'rgba(255, 20, 147, 0.1)',
    borderColor: '#FF1493',
  },
  clickAreaText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  clickHint: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7A00FF',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  finalEnergyText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 5,
  },
  restartButton: {
    backgroundColor: '#7A00FF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  tipText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default App;