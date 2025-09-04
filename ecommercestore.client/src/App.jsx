import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import RouterCustom from "./router";
import { CartProvider } from "./context/CartContext"

function App() {
    return (
        <div>
            <AuthProvider>
                <CartProvider>
                    <BrowserRouter>
                        <RouterCustom />
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </div>
    );
}
export default App;
