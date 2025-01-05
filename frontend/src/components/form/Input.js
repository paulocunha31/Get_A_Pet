import styles from "./Input.module.css";

function Input({
  type,
  text,
  name,
  placeholder,
  handleOnchange,
  multiple,
  value,
}) {
  return (
    <div className={styles.form_control} >
      <label htmlFor={name}>{text}:</label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        onChange={handleOnchange}
        value={value}
        {...(multiple ? {multiple}: "")}
      ></input>
    </div>
  );
}

export default Input;
