import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../login/loginPage'
import SignUpPage from '../signUp/signUpPage'
import Home from '../home/home'
import ProductDetailsPage from '../details/productDetails'
import ServicosDetailsPage from '../details/servicosDetails'
import LandingPage from '../landing/landingPage'
import AdminPage from '../admin/adminPage'

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/produtos/:id" element={<ProductDetailsPage />} />
                <Route path="/servicos/:id" element={<ServicosDetailsPage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </BrowserRouter>
    )
}
