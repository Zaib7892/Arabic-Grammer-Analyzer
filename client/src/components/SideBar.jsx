// SideBar.jsx

import React, { useState } from 'react';
import { FaHome, FaUpload, FaBars,FaDochub,FaClipboardList} from 'react-icons/fa';
import { FaDiceD20 } from "react-icons/fa6";
import { BiSpreadsheet } from "react-icons/bi";
import logo from './logo.png';
import { NavLink } from 'react-router-dom';
import '../App.css';

const SideBar = ({ children }) => {
    const [isOpen,setIsOpen] = useState(false); 
    const toggle = () => setIsOpen(!isOpen);
    const menuItems = [
        {
            path: "/home",
            name: "Home",
            icon: <FaHome />
        },
        {
            path: "/uploadtext",
            name: "UploadText",
            icon: <FaUpload />
        },
        {
            path: "/diacritization",
            name: "Diacritization",
            icon: <FaDochub />
        },
        {
            path: "/syntacticanalysis",
            name: "Syntactic Analysis",
            icon: <FaDiceD20 />
        },
        {
            path: "/standardsolutions",
            name: "Standard Solutions",
            icon: <BiSpreadsheet />
        },
        {
            path: "/test",
            name: "Test",
            icon: <FaClipboardList />
        },
        {
            path: "/semanticanalysis",
            name: "Semantic Analysis",
            icon: <FaClipboardList />
        }
    ];

    return (
        <div className='container'>
            <div style = {{width:isOpen ? '300px': '50px'}}className="sidebar"> 
                <div className="top_section">
                    <div className='logo'><img src={logo} alt="Logo" style={{display:isOpen ? 'block': 'none', width: '100px', height: 'auto' }} /></div>
                    <div style={{marginLeft:isOpen? '50px':'0px'}} className="bars"><FaBars onClick={toggle}/></div>
                </div>
                {
                    menuItems.map((item, index) => (
                        <NavLink to={item.path} key={index} className="link" activeClassName='active'>
                            <div className="icon">{item.icon}</div>
                            <div style={{display:isOpen ? 'block': 'none'}}className="link_text">{item.name}</div>
                        </NavLink>
                    ))
                }
            </div>
            <main>{children}</main>
        </div>
    );
};

export default SideBar;
