import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Online Dairy Farmer Management System
      </h1>

      <p style={styles.text}>
        A web-based system for online registration and management of dairy
        farmers, livestock, staff, and dairy products.
      </p>

      <div style={styles.buttonBox}>
        <Link to="/login" style={styles.button}>Login</Link>
        <Link to="/register" style={styles.button}>Register</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020520ff",
    textAlign: "center"
  },
  title: {
    color: "#2a05cfff"
  },
  text: {
    width: "60%",
    margin: "20px 0",
    fontSize: "16px"
  },
  buttonBox: {
    display: "flex",
    gap: "20px"
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#2ecc71",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px"
  }
};

export default Home;
