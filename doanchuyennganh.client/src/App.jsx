import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import RouterCustom from "./router";

function App() {
    return (
        <div>
            <AuthProvider>
                <BrowserRouter>
                    <RouterCustom />
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

export default App;
