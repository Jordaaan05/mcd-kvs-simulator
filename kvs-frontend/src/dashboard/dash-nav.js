/* 
    Dashboard navigation section
*/

import React from "react";
import { useAuth } from "../authContext";

function DashNav({ handlePageChange, activePage }) {
    const { logout } = useAuth()

    const getClassName = (page) => {
        return page === activePage ? 'active' : '';
    };

    return (
        <nav>
            <span onClick={() => handlePageChange('dashhome')} className={getClassName('dashhome')}>Home</span>
            <span onClick={() => handlePageChange('dashstations')} className={getClassName('dashstations')}>Stations</span>
            <span onClick={() => handlePageChange('dashitems')} className={getClassName('dashitems')}>Menu</span>
            <span onClick={() => handlePageChange('dashcategories')} className={getClassName('dashcategories')}>Categories</span>
            <span onClick={() => handlePageChange('settings')} className={getClassName('settings')}>Settings</span>
            <span onClick={() => logout()} style={{float: "right"}}>Logout</span>
        </nav>
    )
}

export default DashNav