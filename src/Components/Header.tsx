import ThemeToggle from '../features/theme/ThemeToggle';
import styles from './styles/Header.module.scss';

const Header = () => {
  return (
    <header className={styles.container}>
      <div className={styles.theme}>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
