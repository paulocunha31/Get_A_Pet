import api from "../../../utils/api";

import { useState, useEffect } from "react";

import styles from "./MyAdoptions.module.css";

function MyAdoptions() {
  const [pets, setPets] = useState([]);
  const [token] = useState(localStorage.getItem("token" || ""));

  useEffect(() => {
    async function myadoptions() {
      await api
        .get(`pets/myadoptions`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        })
        .then((response) => {
          setPets(response.data.pets);
        });
    }
    myadoptions();
  }, [token]);

  return (
    <section>
      <div className={styles.petlist_header}>
        <h1>Minhas adoções</h1>
      </div>
      <div className={styles.pet_container}>
        {pets.length > 0 &&
          pets.map((pet) => (
            <div key={pet._id} className={styles.pet_card}>
              <div
                style={{
                  backgroundImage: `url(${process.env.REACT_APP_API}/images/pets/${pet.images[0]})`,
                }}
                className={styles.pet_card_image}
              ></div>
              <div>
                <span className="bold">{pet.name}</span>
              </div>

              <div className={styles.contacts}>
                <p>
                  <span className="bold">Ligue para:</span> {pet.user.phone}
                </p>
                <p>
                  <span className="bold">Falar com:</span> {pet.user.name}
                </p>
              </div>
              <div className={styles.actions}>
                {pet.available ? (
                  <p>Adoção em processo</p>
                ) : (
                  <p>Parabéns por concluir a adoção</p>
                )}
              </div>
            </div>
          ))}
        {pets.length === 0 && <p>Ainda não há adoçôes de Pets.</p>}
      </div>
    </section>
  );
}

export default MyAdoptions;
