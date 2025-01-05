import { Link } from "react-router-dom";

import Logo from "../../assets/logo.png";

import { IoMenu } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";

import styles from "./Header.module.css";
import { useState, useContext } from "react";

import { Context } from "../../context/UserContext";

function Header() {
  const [menu, setMenu] = useState(false);
  const { authenticated, logout } = useContext(Context);

  function menuMobile() {
    setMenu(!menu);
  }

  return (
    <header className={styles.header}>
      <div className={styles.header_logo}>
        <img src={Logo} alt="Get-a-Pet" />
        <h2>Get a Pet</h2>
      </div>

      <button id={styles.openMenu} onClick={menuMobile}>
        <IoMenu />
      </button>

      <nav className={`${styles.navbar} ${menu ? styles.active : ""}`}>
        <button id={styles.closeMenu} onClick={menuMobile}>
          <IoIosClose />
        </button>

        <ul>
          <li>
            <Link to={"/"} onClick={menuMobile}>
              Adotar
            </Link>
          </li>
          {authenticated ? (
            <>
              <li>
                <Link to={"/pet/myadoptions"} onClick={menuMobile}>Minhas adoçôes</Link>
              </li>
              <li>
                <Link to={"/pet/mypets"} onClick={menuMobile}>Meus Pets</Link>
              </li>
              <li>
                <Link to={"/user/profile"} onClick={menuMobile}>Perfil</Link>
              </li>
              <li onClick={() => {logout(); menuMobile()} }>Sair</li>
            </>
          ) : (
            <>
              <li>
                <Link to={"/login"} onClick={menuMobile}>
                  Entrar
                </Link>
              </li>
              <li>
                <Link to={"/register"} onClick={menuMobile}>
                  Cadastrar
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {menu && <div className={styles.overlay} onClick={menuMobile}></div>}
    </header>
  );
}

export default Header;
