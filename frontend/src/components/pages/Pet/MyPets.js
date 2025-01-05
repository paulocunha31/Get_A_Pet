import api from "../../../utils/api";

import styles from "./MyPets.module.css";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// hooks
import useFlashMessage from "../../../hooks/useFlashMessage";

function MyPets() {
  const [pets, setPets] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    api
      .get("/pets/mypets", {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => {
        setPets(response.data.pets);
      });
  }, [token]);

  async function removePet(id) {
    let msgType = "success";

    const data = await api
      .delete(`/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => {
        const updatedPets = pets.filter((pet) => pet._id !== id);
        setPets(updatedPets);
        return response.data;
      })
      .catch((err) => {
        msgType = "error";
        return err.response.data;
      });

    setFlashMessage(data.message, msgType);
  }

  async function concludAdoption(id) {
    let msgType = "success";

    const data = await api
      .patch(
        `/pets/conclude/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      )
      .then((response) => {
        const updatedPets = pets.filter((pet) => pet._id !== id);
        setPets(updatedPets);
        return response.data;
      })
      .catch((err) => {
        msgType = "error";
        return err.response.data;
      });
    setFlashMessage(data.message, msgType);
  }

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.titleRow}>
          <h2>Meus Pets</h2>
          <Link to={"/pet/add"}>Cadastrar Pet</Link>
        </div>

        <ul className={styles.petList}>
          {pets.map((pet) => (
            <li key={pet._id} className={styles.pet_item}>
              <img
                src={`${process.env.REACT_APP_API}/images/pets/${pet.images[0]}`}
                alt={pet.name}
                className={styles.petImage}
              />
              <div className={styles.petDetails}>
                <strong className={styles.petName}>{pet.name}</strong>
              </div>

              <div className={styles.action_buttons}>
                {pet.available ? (
                  <>
                    {pet.adopter && (
                      <button
                        className={styles.conclude_btn}
                        onClick={() => concludAdoption(pet._id)}
                      >
                        Concluir adoção
                      </button>
                    )}
                    <Link
                      to={`/pet/edit/${pet._id}`}
                      className={styles.editButton}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => removePet(pet._id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <p>Pet já adotado!</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default MyPets;
