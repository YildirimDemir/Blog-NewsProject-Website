import Style from "./../profile.module.css";
import { Dispatch, SetStateAction } from "react";

interface SidebarProps {
    setContent: Dispatch<SetStateAction<string>>;
}

export default function Sidebar({ setContent }: SidebarProps) {
    return (
        <div className={Style.sidebar}>
            <ul className={Style.sidemenu}>
                <li className={Style.sideitem}>
                    <button onClick={() => setContent("userinfo")}>
                        | User Info
                    </button>
                    <button onClick={() => setContent("password")}>
                        | Password
                    </button>
                    <button onClick={() => setContent("deleteaccount")}>
                        | Delete
                    </button>
                    <button onClick={() => setContent("likes")}>
                        | Likes
                    </button>
                    <button onClick={() => setContent("comments")}>
                        | Comments
                    </button>
                </li>
            </ul>
        </div>
    );
}
