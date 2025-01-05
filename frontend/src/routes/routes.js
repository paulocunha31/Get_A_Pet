import { Routes, Route } from "react-router-dom";

// components
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Container from "../components/layouts/Container";
import Message from '../components/layouts/Message'

// pages
import Login from "../components/pages/Auth/Login";
import Register from "../components/pages/Auth/Register";
import Home from "../components/pages/Home";
import Profile from "../components/pages/User/Profile";
import MyPets from "../components/pages/Pet/MyPets";
import AddPet from "../components/pages/Pet/AddPet";
import EditPet from "../components/pages/Pet/EditPet";
import PetDetails from "../components/pages/Pet/PetDetails";

// context
import { UserProvider } from "../context/UserContext";
import MyAdoptions from "../components/pages/Pet/MyAdoptions";

function Router() {
  return (
    <>
    <UserProvider>
      <Header />
      <Message/>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/pet/mypets" element={<MyPets />} />
          <Route path="/pet/add" element={<AddPet />} />
          <Route path="/pet/edit/:id" element={<EditPet />} />
          <Route path="/pet/myadoptions" element={<MyAdoptions />} />
          <Route path="/pet/:id" element={<PetDetails />} />
        </Routes>
      </Container>
      <Footer />
      </UserProvider>
    </>
  );
}

export default Router;
