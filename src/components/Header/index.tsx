import styles from './header.module.scss'

export function Header() {
  return(
    <header className={styles.headerContainer}>
      <a href="/">
        <img src="/logo.svg" alt="logo" />
      </a>
    </header>
  )
}
