import { monedaDOM, montoCLPDOM, resultadoDOM } from "./script.js";

async function getMonedas(code) {
  const endpoint = `https://mindicador.cl/api/${code}`;
  console.log(endpoint);
  try {
    const res = await fetch(endpoint);
    const monedas = await res.json();
    return monedas;
  } catch (error) {
    console.log(error);
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

  // Convert the number to a string
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
    .map((moneda) => formatDate(moneda.fecha))
    .reverse();
  const titulo = `Evoluicion de ${data.codigo}`;
  const colorDeLinea = "red";
  const valores = data.serie.map((moneda) => moneda.valor).reverse();

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

function destroyCharts(charts) {
  //   console.log(Object.keys(charts), charts);
  Object.keys(charts).forEach((key) => {
    charts[key].destroy();
  });
}

async function renderGrafica(config) {
  const chartDOM = document.getElementById("myChart");
  const charts = Chart.instances;
  //   console.log(charts);

  if (Object.keys(charts).length !== 0) {
    destroyCharts(charts);
  }
  new Chart(chartDOM, config);
}
function convertirMoneda(data) {
  const monto = Number(montoCLPDOM.value);
  if (!monto) return;
  const tc = data.serie[0].valor;
  console.log(tc);
  const montoConvertido = monto / tc;
  return [formatNumber(montoConvertido), formatNumber(tc)];
}

function agregarConversion(montoOG, montoCambiado, tipoCambio) {
  resultadoDOM.innerText = `Resultado: ${montoOG} CLP @ ${tipoCambio} = ${montoCambiado}`;
}
async function onclick(e) {
  e.preventDefault();
  const montoOG = Number(montoCLPDOM.value);
  const moneda = monedaDOM.value;
  if (!moneda || !montoOG) return;
  const data = await getMonedas(moneda);
  const montoConvertido = convertirMoneda(data);
  agregarConversion(formatNumber(montoOG), ...montoConvertido);
  const config = prepararConfiguracionParaLaGrafica(data);
  renderGrafica(config);
}

export { onclick };
