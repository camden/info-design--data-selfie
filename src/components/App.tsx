import React from 'react';
import Map from './Map';

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Birds in Motion</h1>
      <Map />
    </div>
  );
}

export default App;
