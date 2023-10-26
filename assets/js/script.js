import { onclick } from "./functions.js";

const monedaDOM = document.getElementById("moneda");
const montoCLPDOM = document.getElementById("montoCLP");
const resultadoDOM = document.getElementById("result");
const btn = document.querySelector("button");

export { monedaDOM, montoCLPDOM, resultadoDOM };

btn.addEventListener("click", onclick);

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    onclick(e);
  }
});
