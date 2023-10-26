import { monedaDOM, montoCLPDOM, resultadoDOM } from "./script.js";

const coins = {
  euro: "EUR",
  uf: "UF",
  dolar: "USD",
};

async function getMonedas(code) {
  const endpoint = `https://mindicador.cl/api/${code}`;
  // console.log(endpoint);
  try {
    const res = await fetch(endpoint);
    // console.log(res);
    if (res.status !== 200) {
      throw new Error(res.statusText);
    }
    const monedas = await res.json();
    return monedas;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Adding 1 to the month since it's zero-based
  const day = date.getUTCDate().toString().padStart(2, "0");
  const year = date.getUTCFullYear().toString();

  return `${year}-${month}-${day}`;
}

function formatNumber(number) {
  // Check if the input is not a number
  if (isNaN(number)) {
    return "Invalid Input";
  }

  // Convert the number to a string in case it doesnt have decimal places just leave as is
  let numberString =
    number % 1 === 0 ? number.toString() : number.toFixed(2).toString();

  // Split the string into integer and decimal parts (if any)
  const parts = numberString.split(".");

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Join the integer and decimal parts with a dot (if there's a decimal part)
  const formattedNumber = parts.length === 2 ? parts.join(".") : parts[0];

  return formattedNumber;
}

function prepararConfiguracionParaLaGrafica(data) {
  // Creamos las variables necesarias para el objeto de configuración
  const tipoDeGrafica = "line";
  const nombresDeLasMonedas = data.serie
    .map((point) => formatDate(point.fecha))
    .slice(0, 10)
    .reverse();
  const titulo = `Evolución de ${coins[data.codigo]}`;
  const colorDeLinea = "red";
  const valores = data.serie
    .map((point) => point.valor)
    .slice(0, 10)
    .reverse();

  const config = {
    type: tipoDeGrafica,
    data: {
      labels: nombresDeLasMonedas,
      datasets: [
        {
          label: titulo,
          backgroundColor: colorDeLinea,
          data: valores,
        },
      ],
    },
  };
  // console.log(nombresDeLasMonedas);
  return config;
}

function destroyCharts() {
  const charts = Chart.instances;
  // console.log(Object.keys(charts), charts);
  // si es que hay algun chart lo destruye sino no, necesario para reemplazar un chart
  Object.keys(charts).forEach((key) => {
    charts[key].destroy();
  });
}

async function renderGrafica(config) {
  const chartDOM = document.getElementById("myChart");
  // esta clase es overraidiada por el css despues de crear un chart
  chartDOM.classList.toggle("display-none");
  destroyCharts();
  new Chart(chartDOM, config);
}
function convertirMoneda(data, montoOG) {
  if (!montoOG) return;
  const tc = data.serie[0].valor;
  // console.log(tc);
  const montoConvertido = montoOG / tc;
  return [formatNumber(montoConvertido), formatNumber(tc)];
}

function agregarConversion(montoOG, moneda, montoCambiado, tipoCambio) {
  resultadoDOM.innerText = `${montoOG} CLP @ ${tipoCambio} = ${montoCambiado} ${moneda}`;
}
async function onclick(e) {
  e.preventDefault();
  const montoOG = Number(montoCLPDOM.value);

  // handles if the input is not a number
  if (!montoOG) {
    resultadoDOM.innerText = "Escribe un monto";
    return;
  }

  const moneda = monedaDOM.value;
  // handles if moneda is not selected
  if (!moneda) {
    // console.log({ moneda, bool: Boolean(moneda) });
    resultadoDOM.innerText = "Selecciona una moneda";
    return;
  }
  // if (!moneda || !montoOG) return;

  const data = await getMonedas(moneda);

  // handles if there is an error in API call
  if (data instanceof Error) {
    destroyCharts();
    handleError(data);
    return;
  }

  const montoConvertido = convertirMoneda(data, montoOG);
  agregarConversion(formatNumber(montoOG), coins[moneda], ...montoConvertido);
  const config = prepararConfiguracionParaLaGrafica(data);
  renderGrafica(config);
}

function handleError(err) {
  console.log(err);
  resultadoDOM.innerText = `${err}`;
}

export { onclick };
