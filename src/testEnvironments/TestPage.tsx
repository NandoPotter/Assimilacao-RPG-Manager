import { Link } from "react-router-dom";

function HomePage() {
    return(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
            
            <h1>Home Page</h1>
            
            <h2>Links para navegação Oficiais:</h2>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/login">Login</Link>
            
            <hr />
        </div>
    );
}

export default HomePage;