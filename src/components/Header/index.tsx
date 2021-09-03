import styles from './header.module.scss'

export function Header() {
  return(
    <div className={styles.headerContainer}>
      <img src="/Logo.svg" alt="logo" />
    </div>
  )
}
