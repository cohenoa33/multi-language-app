import React, { useState, useEffect } from "react";
import "./App.css";

import { LanguageProvider } from "./containers/Language";
import { UserProvider } from "./containers/User";
import { ThemeContext, themes } from "./containers/Theme";

import { reAuthentication, signup, login } from "./services";

import LanguageSelector from "./components/Header/LanguageSelector";
import LoginSignup from "./components/SigninSignup/LoginSignup";
import Appointments from "./components/Appointments/Appointments";
import Title from "./components/Appointments/Title";
import SignOut from "./components/Navbar/SignOut";
import Navbar from "./components/Navbar/Navbar";
import AddNewButton from "./components/Navbar/AddNewButton";
import Footer from "./components/Footer/Footer";
import NewAppointment from "./components/Appointments/NewAppointment";

function App() {
  const [theme, setTheme] = useState(
    window.localStorage.getItem("user-lang") === "en" ||
      window.localStorage.getItem("user-lang") == null
      ? themes.ltr
      : themes.rtl
  );

  const [user, setUser] = useState({});
  const [jwt, setJwt] = useState(
    localStorage.token ? localStorage.token : null
  );
  const [addNew, setAddNew] = useState(false);
  const [error, setError] = useState();
  const [searchWindow, setSearchWindow] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    if (localStorage.token) {
      reAuthentication().then((data) => {
        if (!data.message) {
          setUser(data.user);
        } else {
          setError(data.message);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!searchWindow) {
      setSearch(false);
    }
  }, [searchWindow]);

  const handleSignInUp = (user) => {
    (user.password_confirmation ? signup(user) : login(user)).then((data) => {
      !data.error ? handleAuthResponse(data) : setError(data.error);
    });
  };

  const handleAuthResponse = (data) => {
    !data.user ? alert(data) : (localStorage.token = data.jwt);
    setUser(data.user);
    setJwt(data.jwt);
    setError();
  };

  const addNewAppointment = (appointment) => {
    const updateList = user.appointments.concat(appointment);
    setUser((prevState) => ({ ...prevState, appointments: updateList }));
    setAddNew(!addNew);
  };

  const updateAppointmentsList = (appointment, action) => {
    let id = typeof appointment === "number" ? appointment : appointment.id;
    let filteredList = user.appointments.filter((a) => a.id !== id);
    let updateList =
      action === "edit" ? filteredList.concat(appointment) : filteredList;
    setUser((prevState) => ({ ...prevState, appointments: updateList }));
  };

  const [appointments, setAppointments] = useState(user.appointments);

  useEffect(() => {
    setAppointments(user.appointments);
  }, [user]);

  const setLogout = () => {
    setUser({});
    setJwt();
    localStorage.clear();
  };

  const renderLanguages = () => (
    <LanguageSelector
      changeTheme={() =>
        setTheme(
          window.localStorage.getItem("user-lang") === "en"
            ? themes.ltr
            : themes.rtl
        )
      }
    />
  );

  const renderLoginSignup = () => (
    <LoginSignup handleSignInUp={handleSignInUp} error={error} />
  );

  const renderAddNewButton = () => (
    <AddNewButton setAddNew={() => setAddNew(!addNew)} />
  );
  const renderSignUp = () => <SignOut setLogout={setLogout} />;

  return (
    <LanguageProvider>
      <UserProvider user={user}>
        <ThemeContext.Provider value={theme}>
          <div className="container" style={theme}>
            <Navbar
              setSearch={setSearch}
              searchWindow={searchWindow}
              setSearchWindow={setSearchWindow}
              jwt={jwt}
              renderLanguages={renderLanguages}
              renderAddNewButton={renderAddNewButton}
              renderSignUp={renderSignUp}
            />
            {!jwt ? (
              renderLoginSignup()
            ) : (
              <div className="content">
                {!addNew ? (
                  <div>
                    <div className="hidden"></div>
                    <Title />
                    <Appointments
                      searchWindow={searchWindow}
                      setSearchWindow={setSearchWindow}
                      appointments={appointments}
                      search={search}
                      updateAppointmentsList={updateAppointmentsList}
                    />
                  </div>
                ) : (
                  <NewAppointment
                    user={user.id}
                    addNewAppointment={addNewAppointment}
                    addNew={addNew}
                    setAddNew={setAddNew}
                  />
                )}
              </div>
            )}
            <Footer />
          </div>
        </ThemeContext.Provider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
