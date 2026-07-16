export interface MetaAdsCamposExtraidos {
  gasto?: number;
  compras?: number;
  conversas?: number;
  custoPorCompra?: number;
  custoPorConversa?: number;
  valorConvertido?: number;
  roas?: number;
  ctr?: number;
  cpm?: number;
}

function paraNumero(texto: string): number | undefined {
  let limpo = texto
    .replace(/[Rr]\$\s?/g, "")
    .replace(/US\$\s?/gi, "")
    .replace(/%/g, "")
    .trim();

  const temVirgulaDecimal = /,\d{1,2}$/.test(limpo);
  if (temVirgulaDecimal) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    limpo = limpo.replace(/,/g, "");
  }
  limpo = limpo.replace(/[^\d.-]/g, "");

  const valor = parseFloat(limpo);
  return Number.isNaN(valor) ? undefined : valor;
}

const NUM = "([\\d.,]+)\\s*%?";

const PADROES: { chave: keyof MetaAdsCamposExtraidos; regexes: RegExp[] }[] = [
  {
    chave: "gasto",
    regexes: [
      new RegExp(`valor\\s*usad[oa][^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`amount\\s*spent[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`gast[oa]s?[^\\d\\n]{0,30}${NUM}`, "i"),
    ],
  },
  {
    chave: "compras",
    regexes: [
      new RegExp(`compras?[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`purchases?[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`resultados?[^\\d\\n]{0,30}${NUM}`, "i"),
    ],
  },
  {
    chave: "conversas",
    regexes: [
      new RegExp(`conversas?(?:\\s*(?:por\\s*mensagens?)?(?:\\s*iniciadas?)?)?[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`messaging\\s*conversations?(?:\\s*started)?[^\\d\\n]{0,30}${NUM}`, "i"),
    ],
  },
  {
    chave: "custoPorCompra",
    regexes: [
      new RegExp(`custo\\s*por\\s*compras?[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`cost\\s*per\\s*purchase[^\\d\\n]{0,30}${NUM}`, "i"),
    ],
  },
  {
    chave: "custoPorConversa",
    regexes: [
      new RegExp(`custo\\s*por\\s*conversas?(?:\\s*por\\s*mensagens?)?[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`cost\\s*per\\s*(?:messaging\\s*)?conversation[^\\d\\n]{0,30}${NUM}`, "i"),
    ],
  },
  {
    chave: "valorConvertido",
    regexes: [
      new RegExp(`valor\\s*de\\s*convers[ãa]o(?:\\s*de\\s*compras?)?[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`conversion\\s*value[^\\d\\n]{0,30}${NUM}`, "i"),
      new RegExp(`purchases?\\s*conversion\\s*value[^\\d\\n]{0,30}${NUM}`, "i"),
    ],
  },
  {
    chave: "roas",
    regexes: [
      new RegExp(`roas[^\\d\\n]{0,40}${NUM}`, "i"),
      new RegExp(`retorno\\s*sobre\\s*o\\s*investimento[^\\d\\n]{0,40}${NUM}`, "i"),
    ],
  },
  {
    chave: "ctr",
    regexes: [new RegExp(`ctr[^\\d\\n]{0,40}${NUM}`, "i")],
  },
  {
    chave: "cpm",
    regexes: [new RegExp(`cpm[^\\d\\n]{0,40}${NUM}`, "i")],
  },
];

export function extrairCamposDoTexto(textoOcr: string): MetaAdsCamposExtraidos {
  const resultado: MetaAdsCamposExtraidos = {};

  const textoUnicoComQuebras = textoOcr.replace(/[ \t]+/g, " ");
  const textoUnico = textoUnicoComQuebras.replace(/\n/g, " ");

  for (const { chave, regexes } of PADROES) {
    for (const regex of regexes) {
      const match = textoUnico.match(regex) ?? textoUnicoComQuebras.match(regex);
      if (match) {
        const numero = paraNumero(match[1]);
        if (numero !== undefined) {
          resultado[chave] = numero;
          break;
        }
      }
    }
  }

  return resultado;
}

export async function reconhecerImagemMetaAds(
  arquivo: File,
): Promise<{ texto: string; campos: MetaAdsCamposExtraidos }> {
  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker("por+eng");
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
    });
    const { data } = await worker.recognize(arquivo);
    const texto = data.text ?? "";
    return { texto, campos: extrairCamposDoTexto(texto) };
  } finally {
    await worker.terminate();
  }
}
