import { NavbarBrand, Navbar } from "react-bootstrap";
import Link from "next/link";
import React from "react";

export default function Navigation() {
  return (
    <Navbar
      expand="lg"
      className="py-3 px-4 shadow-sm"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="container-fluid">
        {/* ✅ SanctionLab 로고 (좌측 여백 + 교체된 이미지) */}
        <Link href="/" passHref className="d-flex align-items-center">
          <NavbarBrand className="me-0" style={{ paddingLeft: "12px" }}>
            <img
              src="https://www.sanctionlab.com/wp-content/uploads/2024/10/s-logo.png"
              width="45"
              height="10"
              className="align-top"
              alt="SanctionLab"
            />
          </NavbarBrand>
        </Link>
      </div>
    </Navbar>
  );
}
