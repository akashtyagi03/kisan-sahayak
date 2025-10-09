import React from 'react'
import './App.css'
import Landing from './components/Landing'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Login } from './pages/Login'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Signup />} />
          <Route path="/login" element={ <Login />} />
          <Route path="/dashboard" element={ <Landing />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
