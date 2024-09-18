import Style from './footer.module.css'

export default function Footer() {
  return (
    <footer className={Style.footer}>
        <p className={Style.copyText}>&copy; by Murka Digital. Admin Panel</p>
    </footer>
  )
}