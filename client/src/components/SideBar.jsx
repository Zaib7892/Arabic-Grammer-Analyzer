import { RiFeedbackFill } from "react-icons/ri";
import { FaClipboardQuestion } from "react-icons/fa6";
import { SiGraphql } from "react-icons/si";
import React, { useContext, useState } from 'react';
import { FaHome, FaBars, FaDochub } from 'react-icons/fa';
import { FaDiceD20 } from "react-icons/fa6";
import { BiSpreadsheet } from "react-icons/bi";
import { PiListStarLight } from "react-icons/pi";
import logo from './logo.png';
import { NavLink } from 'react-router-dom';
import { LoginContext } from "./ContextProvider/Context";
import '../App.css';

const SideBar = ({ children }) => {
    const { logindata } = useContext(LoginContext);
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const menuItems = [
        {
            path: "/home",
            name: "Home",
            icon: <FaHome />
        },
        {
            path: "/diacritization",
            name: "Diacritization",
            icon: <FaDochub />
        },
        {
            path: "/uploadtext",
            name: "Syntactic Analysis",
            icon: <FaDiceD20 />
        },
        {
            path: "/semanticanalysis",
            name: "Semantic Analysis",
            icon: <SiGraphql />
        },
        {
            path: "/previousanalysis",
            name: "Previuos Semantic Analysis",
            icon: <PiListStarLight />
        },
        {
            path: "/standardsolutions",
            name: "Standard Solutions",
            icon: <BiSpreadsheet />
        }
    ];

    if (logindata.ValidUserOne?.type === 'u') {
        menuItems.push({
            path: "/test",
            name: "Test",
            icon: <FaClipboardQuestion />
        });
    }

    if (logindata.ValidUserOne?.type === 'a') {
        menuItems.push({
            path: "/viewfeedback",
            name: "Feedbacks",
            icon: <RiFeedbackFill/>
        });
    }

    return (
        <div className='container'>
            <div style={{ width: isOpen ? '300px' : '50px' }} className="sidebar">
                <div className="top_section">
                    <div className='logo'>
                        <img src={logo} alt="Logo" style={{ display: isOpen ? 'block' : 'none', width: '100px', height: 'auto' }} />
                    </div>
                    <div style={{ marginLeft: isOpen ? '50px' : '0px' }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {
                    menuItems.map((item, index) => (
                        <NavLink to={item.path} key={index} className="link" activeClassName='active'>
                            <div className="icon">{item.icon}</div>
                            <div style={{ display: isOpen ? 'block' : 'none' }} className="link_text">{item.name}</div>
                        </NavLink>
                    ))
                }
            </div>
            <main>{children}</main>
        </div>
    );
};

export default SideBar;
