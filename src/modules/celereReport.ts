import { format } from "@std/datetime";

import { logging } from "./../utils/utils.ts";
import { sendReport } from "./sendReport.ts";
import { webVitalsLabels } from "./../utils/webVitalsLabels.ts";

export interface CelereReport {
  fetchTime: string;
  finalDisplayedUrl: string;
  categories: {
    performance: {
      score: number;
    };
    accessibility: {
      score: number;
    };
    "best-practices": {
      score: number;
    };
    seo: {
      score: number;
    };
  };
  audits: {
    "largest-contentful-paint": {
      numericValue: number;
    };
    "cumulative-layout-shift": {
      numericValue: number;
    };
    "first-contentful-paint": {
      numericValue: number;
    };
    "total-blocking-time": {
      numericValue: number;
    };
    "server-response-time": {
      numericValue: number;
    };
  };
}

export function celereReport(report: string): void {
  const content: CelereReport = JSON.parse(report);

  // Info
  const url = new URL(content.finalDisplayedUrl);
  const hostname = url.host;

  const date = new Date(content.fetchTime);
  const formattedDate = format(date, "dd/MM/yyyy, HH:mm:ss");

  // Web Vitals
  const lcp = content.audits["largest-contentful-paint"].numericValue;
  const cls = content.audits["cumulative-layout-shift"].numericValue;
  const fcp = content.audits["first-contentful-paint"].numericValue;
  const tbt = content.audits["total-blocking-time"].numericValue;
  const ttfb = content.audits["server-response-time"].numericValue;

  // Web Vitals Labels
  const labels = webVitalsLabels([lcp, cls, fcp, tbt, ttfb]);

  // const lcp2 = content.audits["largest-contentful-paint"].displayValue;
  // const cls2 = content.audits["cumulative-layout-shift"].displayValue;
  // const fcp2 = content.audits["first-contentful-paint"].displayValue;
  // const tbt2 = content.audits["total-blocking-time"].displayValue;
  // const ttfb2 = content.audits["server-response-time"].displayValue;
  // console.log([lcp, cls, fcp, tbt, ttfb]);
  // console.log([lcp2, cls2, fcp2, tbt2, ttfb2]);

  // Scores
  const performance = content.categories.performance.score * 100;
  const accessibility = content.categories.accessibility.score * 100;
  const bestPractices = content.categories["best-practices"].score * 100;
  const seo = content.categories.seo.score * 100;

  // Email Content
  const emailSubject = `${hostname} - Core Web Vitals: ${labels.cwv} - Desempenho: ${performance}`;
  const emailBody = `
  URL: ${content.finalDisplayedUrl}<br>
  Criação do relatório: ${formattedDate}<br><br>

  - Web Vitals -<br>
  Core Web Vitals (LCP, CLS, TBT): ${labels.cwv}<br>
  Largest Contentful Paint (LCP): ${labels.lcp}<br>
  Cumulative Layout Shift (CLS): ${labels.cls}<br>
  First Contentful Paint (FCP): ${labels.fcp}<br>
  Total Blocking Time (TBT): ${labels.tbt}<br>
  Time to First Byte (TTFB): ${labels.ttfb}<br><br>

  - Pontuações -<br>
  Desempenho: ${performance}<br>
  Acessibilidade: ${accessibility}<br>
  Práticas recomendadas: ${bestPractices}<br>
  SEO: ${seo}<br><br>

  Este relatório é gerado em um ambiente simulado sem um usuário.
  `;

  if (content) {
    logging("Text report generated.");

    sendReport(emailSubject, emailBody);
  }
}
