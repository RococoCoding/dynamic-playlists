import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import Home from './components/Home';
import Landing from './components/Landing';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/home/:userid" element={<Home />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}


export default App;