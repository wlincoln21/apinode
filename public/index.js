// Importações necessárias

import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import './style.css';
import google from '../../assets/images/google.png';
import { AuthGoogleContext } from './../../contexts/authGoogle';
import { footerData as data } from './../../db/infoData';

export const Login = () => {
  const { signInGoogle, signed, loginError, loginUserWithEmailAndPassword } = useContext(AuthGoogleContext);
  const [loading, setLoading] = useState(false); // Estado de carregamento

  const handleLoginFromGoogle = async () => {
    setLoading(true); // Define o estado de carregamento como verdadeiro
    await signInGoogle();
    setLoading(false); // 
  };

  const handleLoginWithEmailAndPassword = async (e) => {
    setLoading(true); // Define o estado de carregamento como verdadeiro
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    await loginUserWithEmailAndPassword(email, password);
    setLoading(false); // Define o estado de carregamento como falso após o login
  };

  if (!signed) {
    return (
      <div>
        <div className="background-layer"></div>
        <div className="login-page">
          <div className="login-container">
            <img className='logo-login' src={data.logo} alt="logo" />
            <h2>Entrar</h2>
            <form className="form" onSubmit={handleLoginWithEmailAndPassword} >
              <div className="input-container">
                <label htmlFor="email">Email</label>
                <input className='input-value-login' type="email" id="email" autoComplete="current-email" name="email" required />
              </div>
              <div className="input-container">
                <label htmlFor="password">Senha</label>
                <input className="input-value-login" type="password" id="password" autoComplete="current-password" name="password" required />
                {loginError && <p className="error-message">{loginError}</p>}
              </div>
              <button type="submit" disabled={loading}>
                Entrar
              </button>
            </form>
            <div className="social-login">
              <button className="btnGoogle" onClick={handleLoginFromGoogle} >
                <img src={google} alt="Google" />Faça login com o google
              </button>
            </div>
            <div className="register">
              <span>Não tem uma conta? </span>
              <Link className="rem" to="/cadastro">Cadastre-se</Link>
            </div>
          </div>
          {signed && <Navigate to="/home" />}
        </div>
      </div>
    )
  } else {
    return <Navigate to="/home" />;
  }
};

export default Login;
