import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../login/loginPage'
import SignUpPage from '../signUp/signUpPage'
import Home from '../home/home'

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}
