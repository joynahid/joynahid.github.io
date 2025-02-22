import { Twitter, Youtube, Facebook, Code, Mail, Phone, X, TwitterIcon, YoutubeIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer mb-12 bg-neutral text-neutral-content text-xs py-10">
      <div className="w-full">
        <aside className="flex flex-col md:items-start">
          <div className="flex flex-row-reverse w-full items-center">
            <p className="text-md flex-nowrap  text-nowrap">
              {/* Copyright */}
              NAHIDSCRIPT &copy; {new Date().getFullYear()}
            </p>
            <hr className="border mr-2 w-full border-neutral-content" />
          </div>
        </aside>
        <div>
          <div className="flex gap-5 items-center">
            <a
              href="https://youtube.com/@nahidscript"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:font-bold"
            >
              YT
            </a>
            <a
              href="https://x.com/nahidscript"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:font-bold"
            >
              X
            </a>

            <a
              href="https://www.linkedin.com/in/joynahid/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:font-bold"
            >
              LINKEDIN
            </a>

            <a
              href="mailto:nahidhasan282@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:font-bold"
            >
              EMAIL
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
