const UNIDADES = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const DIECIS = [
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISEIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
];
const DECENAS = [
  "",
  "",
  "VEINTE",
  "TREINTA",
  "CUARENTA",
  "CINCUENTA",
  "SESENTA",
  "SETENTA",
  "OCHENTA",
  "NOVENTA",
];
const CENTENAS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function tresDigitos(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";

  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];

  if (c > 0) partes.push(CENTENAS[c]);

  if (resto > 0) {
    if (resto < 10) {
      partes.push(UNIDADES[resto]);
    } else if (resto < 20) {
      partes.push(DIECIS[resto - 10]);
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      if (d === 2 && u > 0) {
        partes.push(`VEINTI${UNIDADES[u]}`);
      } else if (u > 0) {
        partes.push(`${DECENAS[d]} Y ${UNIDADES[u]}`);
      } else {
        partes.push(DECENAS[d]);
      }
    }
  }

  return partes.join(" ");
}

function enteroALetras(n: number): string {
  if (n === 0) return "CERO";

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const partes: string[] = [];

  if (millones > 0) {
    partes.push(millones === 1 ? "UN MILLON" : `${tresDigitos(millones)} MILLONES`);
  }
  if (miles > 0) {
    partes.push(miles === 1 ? "MIL" : `${tresDigitos(miles)} MIL`);
  }
  if (resto > 0) {
    partes.push(tresDigitos(resto));
  }

  return partes.join(" ");
}

/** Formats an amount as Peruvian legal currency-in-words, e.g. "CINCUENTA CON 00/100 SOLES". */
export function numeroALetras(amount: number): string {
  const value = Math.max(0, amount);
  const enteros = Math.floor(value);
  const centavos = Math.round((value - enteros) * 100);

  const letras = enteroALetras(enteros);
  const centavosStr = String(centavos).padStart(2, "0");

  return `SON ${letras} CON ${centavosStr}/100 SOLES`;
}
