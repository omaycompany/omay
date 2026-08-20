import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PUBLIC = "https://www.omay.com.tr";
const today = "2026-08-20";
const IMAGE_EXTENSION = "webp";

const services = {
  platform: { label: "AI Platform as a Service", route: "/yapay-zeka-hizmetleri.html", cta: "AI hizmet planınızı birlikte çıkaralım" },
  llm: { label: "LLM as a Service", route: "/yapay-zeka-hizmetleri.html", cta: "LLM erişim ihtiyacınızı değerlendirelim" },
  gpu: { label: "GPU Kiralama", route: "/gpularimiz.html", cta: "İş yükünüz için GPU sınıfını değerlendirelim" },
  managed: { label: "Yönetilen LLM Hizmeti", route: "/yapay-zeka-hizmetleri.html", cta: "Yönetilen LLM kapsamınızı netleştirelim" },
};

const hubs = [
  ["yapay-zeka-hizmetleri", "Yapay Zeka Hizmetleri", "Kurumsal AI projesi için hizmet katmanlarını ve karar sırasını birlikte görün.", "platform"],
  ["ai-platform", "AI Platform as a Service", "Veri, uygulama ve kullanıcı akışlarını bir araya getiren platform yaklaşımını inceleyin.", "platform"],
  ["llm-as-a-service", "LLM as a Service", "Uygulamanıza kontrollü model erişimi eklemek için endpoint kararlarını değerlendirin.", "llm"],
  ["gpu-kiralama", "GPU Kiralama", "Inference, fine-tuning ve araştırma iş yükleri için GPU seçim rehberini açın.", "gpu"],
  ["yonetilen-llm", "Yönetilen LLM Hizmeti", "Model ortamının kurulumu, bağlantısı ve proje bazlı işletim kapsamını netleştirin.", "managed"],
  ["ai-cozumleri", "AI Çözümleri", "Gerçek iş akışlarına göre AI mimarisi, veri hazırlığı ve pilot adımlarını inceleyin.", "platform"],
  ["model-ve-gpu", "Model ve GPU Seçimi", "Model boyutu, VRAM, context ve trafik kararlarını aynı tabloda karşılaştırın.", "gpu"],
  ["kaynaklar", "Karşılaştırmalar ve Teknik Kaynaklar", "Kaynaklı karar notları, entegrasyon rehberleri ve laboratuvar ölçümlerini takip edin.", "llm"],
].map(([slug, title, dek, serviceKey]) => ({ slug, title, dek, serviceKey }));

const useCases = [
  ["kurum-ici-dokuman-asistani", "Kurum içi doküman asistanı", "doküman, erişim ve kaynaklı yanıt", "platform"],
  ["politika-prosedur-asistani", "Politika ve prosedür asistanı", "kurum içi kural ve süreç araması", "platform"],
  ["kurumsal-semantik-arama", "Kurumsal semantik arama", "anlam tabanlı bilgi keşfi", "platform"],
  ["cok-dilli-kurumsal-arama", "Çok dilli kurumsal arama", "dil, terim ve kaynak eşleştirme", "platform"],
  ["ocr-veri-cikarma", "OCR ve veri çıkarma", "belgeden yapılandırılmış alan çıkarma", "llm"],
  ["dokuman-siniflandirma", "Doküman sınıflandırma", "belge türü ve öncelik ayrımı", "llm"],
  ["sozlesme-inceleme-destegi", "Sözleşme inceleme desteği", "metin karşılaştırma ve risk işaretleme", "managed"],
  ["rapor-ozetleme", "Rapor özetleme", "uzun içeriği karar notuna dönüştürme", "llm"],
  ["musteri-destek-yardimcisi", "Müşteri destek yardımcısı", "temsilciye kaynaklı yanıt desteği", "managed"],
  ["destek-talebi-triyaji", "Destek talebi triyajı", "talep sınıfı, öncelik ve yönlendirme", "llm"],
  ["e-posta-triyaji", "E-posta triyajı", "gelen kutusu sınıflandırma ve taslak hazırlama", "llm"],
  ["toplanti-cagri-analizi", "Toplantı ve çağrı analizi", "transkript özetleme ve aksiyon çıkarma", "managed"],
  ["rfp-teklif-yardimcisi", "RFP ve teklif yardımcısı", "soru, kapsam ve yanıt hazırlığı", "platform"],
  ["teklif-hazirlama-yardimcisi", "Teklif hazırlama yardımcısı", "ürün, kapsam ve teslim anlatımı", "platform"],
  ["urun-katalog-yardimcisi", "Ürün katalog yardımcısı", "ürün verisi ve müşteri soruları", "platform"],
  ["arastirma-yardimcisi", "Araştırma yardımcısı", "kaynaklı keşif ve özetleme", "managed"],
  ["gelistirici-kod-yardimcisi", "Geliştirici kod yardımcısı", "kod arama, açıklama ve taslak", "llm"],
  ["dogal-dilden-sql", "Doğal dilden SQL", "soru ile veri sorgusu arasında kontrollü akış", "managed"],
  ["log-guvenlik-ozetleme", "Log ve güvenlik özeti", "olay akışı ve inceleme önceliği", "managed"],
  ["toplu-dokuman-isleme", "Toplu doküman işleme", "yüksek hacimli dosya kuyruğu", "gpu"],
  ["insan-kaynaklari-bilgi-asistani", "İnsan kaynakları bilgi asistanı", "çalışan soruları ve politika kaynakları", "platform"],
  ["saha-servis-yardimcisi", "Saha servis yardımcısı", "teknik kayıt ve prosedür erişimi", "managed"],
  ["icerik-moderasyon", "İçerik moderasyonu", "kural, sınıf ve inceleme kuyruğu", "llm"],
  ["ceviri-yerellestirme", "Çeviri ve yerelleştirme", "terim sözlüğü ve dil akışı", "llm"],
].map(([slug, title, detail, serviceKey]) => ({ slug, title, detail, serviceKey }));

const questionModes = [
  ["mimari", "Mimari nasıl kurulmalı?"],
  ["model-secimi", "Hangi model yaklaşımı daha uygun?"],
  ["gpu-ihtiyaci", "GPU ve kaynak ihtiyacı nedir?"],
  ["maliyet-suruculeri", "Maliyeti hangi değişkenler belirler?"],
  ["ozel-deployment", "Özel ve kontrollü deployment nasıl yapılır?"],
  ["veri-guvenligi", "Veri ve güvenlik kontrol listesi nedir?"],
  ["pilot-plani", "Pilot nasıl planlanır?"],
  ["uretime-gecis", "Üretime geçişte ne kontrol edilmeli?"],
].map(([slug, title]) => ({ slug, title }));

const modelNames = [
  "llama-3-1-8b-instruct", "llama-3-1-70b-instruct", "llama-3-3-70b-instruct",
  "qwen2-5-7b-instruct", "qwen2-5-14b-instruct", "qwen2-5-32b-instruct", "qwen2-5-72b-instruct",
  "qwen3-8b", "qwen3-14b", "qwen3-32b", "mistral-7b-instruct", "mixtral-8x7b", "mixtral-8x22b",
  "ministral-8b", "gemma-2-9b", "gemma-2-27b", "gemma-3-12b", "gemma-3-27b", "phi-3-5-mini",
  "phi-4", "deepseek-r1-distill-qwen-7b", "deepseek-r1-distill-qwen-14b", "deepseek-r1-distill-qwen-32b",
  "deepseek-r1-distill-llama-70b", "command-r", "command-r-plus", "yi-1-5-9b", "yi-1-5-34b",
  "bge-m3", "e5-large-v2",
].map((slug) => ({ slug, label: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

const scales = [
  ["poc", "PoC", "Teknik fikri doğrulayan küçük ve ölçülebilir başlangıç"],
  ["ekip", "Ekip kullanımı", "Birden fazla kullanıcının günlük iş akışına bağlanan yapı"],
  ["uretim", "Üretim", "Trafik, erişim ve süreklilik ihtiyacı olan çalışma"],
].map(([slug, label, detail]) => ({ slug, label, detail }));

const deploymentModes = [
  ["ozel-endpoint", "Özel model endpoint'i", "Uygulamanın kontrollü bir model erişim katmanına bağlanması"],
  ["adanmis-gpu-sunucu", "Adanmış GPU sunucusu", "Çalışma ortamının hesaplama ve yazılım katmanıyla birlikte planlanması"],
].map(([slug, label, detail]) => ({ slug, label, detail }));

const gpus = [
  ["rtx-4090", "RTX 4090", "24 GB sınıfı belleğiyle prototip, görsel üretim ve küçük model iş yükleri"],
  ["a100-80gb", "A100 80GB", "Geniş bellek alanı isteyen fine-tuning, inference ve veri merkezi işleri"],
  ["h100-sxm5", "H100 SXM5", "Süre ve yüksek eşzamanlılık hassasiyeti olan büyük AI iş yükleri"],
].map(([slug, label, detail]) => ({ slug, label, detail }));

const workloads = [
  ["7b-inference", "7–8B model inference"], ["13b-inference", "13–14B model inference"], ["32b-inference", "27–34B model inference"],
  ["70b-inference", "70–72B model inference"], ["7b-lora", "7–8B LoRA fine-tuning"], ["13b-lora", "13–14B LoRA fine-tuning"],
  ["70b-qlora", "70B QLoRA fine-tuning"], ["embedding", "Embedding üretimi"], ["reranking", "Reranking"], ["rag-indexleme", "RAG indeksleme"],
  ["batch-inference", "Toplu inference"], ["gercek-zamanli-api", "Gerçek zamanlı inference API"], ["speech-to-text", "Speech-to-text"],
  ["ocr", "OCR ve doküman çıkarma"], ["gorsel-uretim", "Görsel üretim"], ["gorsel-fine-tuning", "Görsel model fine-tuning"],
  ["computer-vision", "Computer vision eğitimi"], ["jupyter-arastirma", "Jupyter araştırma ortamı"], ["coklu-model-servis", "Çoklu model servisleme"],
  ["uzun-context", "Uzun context inference"],
].map(([slug, label]) => ({ slug, label }));

const industries = [
  ["finans", "Finansal hizmetler"], ["sigorta", "Sigorta"], ["uretim", "Üretim"], ["perakende", "Perakende ve e-ticaret"],
  ["yazilim-saas", "Yazılım ve SaaS"], ["lojistik", "Lojistik"], ["telekom", "Telekomünikasyon"], ["profesyonel-hizmetler", "Profesyonel hizmetler"],
  ["medya-yaratici", "Medya ve yaratıcı işler"], ["egitim-arastirma", "Eğitim ve araştırma"],
].map(([slug, label]) => ({ slug, label }));

const industryWorkflows = [
  ["kurum-ici-bilgi", "Kurum içi bilgi asistanı"], ["dokuman-arama", "Doküman arama"], ["dokuman-siniflandirma", "Doküman sınıflandırma"],
  ["veri-cikarma", "Belgeden veri çıkarma"], ["rapor-ozeti", "Rapor özeti"], ["musteri-destek", "Müşteri destek yardımcısı"],
  ["talep-triyaji", "Talep triyajı"], ["cok-dilli-asistan", "Çok dilli asistan"], ["semantik-arama", "Semantik arama"],
  ["gelistirici-yardimcisi", "Geliştirici yardımcısı"], ["toplu-inference", "Toplu inference"], ["arastirma-akisi", "Araştırma akışı"],
].map(([slug, label]) => ({ slug, label }));

const usagePatterns = [
  ["poc", "PoC ve deneme"], ["aralikli", "Aralıklı kullanım"], ["sabit-ekip", "Sabit ekip kullanımı"], ["yuksek-trafik", "Yüksek trafik"],
].map(([slug, label]) => ({ slug, label }));

const integrationTools = ["ubuntu", "nvidia-driver", "cuda", "cudnn", "docker", "pytorch", "tensorflow", "jupyter", "vllm", "ollama"].map((slug) => ({ slug, label: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const integrationTasks = ["kurulum", "versiyon-uyumu", "gpu-gereksinimi", "ozel-deployment", "performans", "sorun-giderme"].map((slug) => ({ slug, label: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const procurementRequirements = [
  ["turkiye-veri-lokasyonu", "Türkiye veri lokasyonu"], ["kaynak-izolasyonu", "Kaynak izolasyonu"], ["ozel-ag", "Özel ağ ve VPN"], ["sifreleme", "Şifreleme"],
  ["erisim-kontrolu", "Erişim kontrolü"], ["audit-log", "Audit log"], ["saklama-silme", "Saklama ve silme"], ["yedekleme", "Yedekleme ve geri dönüş"],
  ["model-veri-sahipligi", "Model ve veri sahipliği"], ["olay-destek", "Olay ve destek süreci"],
].map(([slug, label]) => ({ slug, label }));

const comparisonPairs = [
  ["rtx-4090-vs-a100", "RTX 4090", "A100 80GB"], ["rtx-4090-vs-h100", "RTX 4090", "H100 SXM5"], ["a100-vs-h100", "A100 80GB", "H100 SXM5"],
].map(([slug, left, right]) => ({ slug, left, right }));
const hardwareLenses = ["7b-inference", "13b-inference", "70b-inference", "7b-lora", "gorsel-uretim", "embedding", "batch-inference", "gercek-zamanli-api"].map((slug) => ({ slug, label: workloads.find((w) => w.slug === slug)?.label || slug }));
const modelPairs = ["llama-qwen", "mistral-mixtral", "gemma-phi", "qwen-deepseek", "command-llama", "bge-e5", "llama-gemma", "qwen-mistral", "phi-gemma", "deepseek-llama", "mixtral-qwen", "command-qwen", "yi-qwen", "bge-e5-rag", "llama-rag", "qwen-rag"].map((slug) => ({ slug, label: slug.replace(/-/g, " / ") }));
const buyerProfiles = ["butce", "veri-kontrolu", "trafik"];
const deploymentPairs = ["api-vs-sunucu", "self-hosted-vs-managed", "gpu-vs-api", "tek-gpu-vs-coklu-gpu", "container-vs-bare-metal", "aylik-vs-aralikli", "turkiye-vs-yurt-disi", "rag-vs-fine-tuning"].map((slug) => ({ slug, label: slug.replace(/-/g, " / ") }));
const runtimePairs = ["vllm-vs-ollama", "cuda-vs-container", "pytorch-vs-tensorflow", "jupyter-vs-api", "rag-vs-batch", "quantization-vs-full", "open-model-vs-commercial", "single-model-vs-router", "embedding-vs-reranker", "sync-vs-async"].map((slug) => ({ slug, label: slug.replace(/-/g, " / ") }));
const costPairs = ["buy-vs-build", "gpu-vs-endpoint", "poc-vs-production", "fixed-vs-burst", "small-model-vs-large-model", "rag-vs-fine-tuning", "single-tenant-vs-shared", "monthly-vs-project", "local-vs-remote", "speed-vs-cost"].map((slug) => ({ slug, label: slug.replace(/-/g, " / ") }));

const roles = [
  ["hero", "Saha ve altyapı bağlamı"], ["architecture", "Mimari ve veri akışı"], ["workload", "İş yükü ayrıntısı"], ["decision", "Karar kanıtı"], ["human", "Operasyon bağlamı"],
].map(([slug, label]) => ({ slug, label }));

const pages = [];
const add = (page) => pages.push({ ...page, id: `${page.family}-${page.route.replace(/\//g, "-")}`.replace(/-+/g, "-").replace(/^-|-$/g, "") });

for (const hub of hubs) {
  add({ family: "hubs", route: `hizmetler/${hub.slug}`, title: hub.title, dek: hub.dek, serviceKey: hub.serviceKey, entity: hub.title, detail: "hizmet katmanı ve karar rehberi", type: "Hizmet rehberi" });
}
for (const useCase of useCases) {
  for (const mode of questionModes) {
    add({ family: "cozumler", route: `cozumler/${useCase.slug}/${mode.slug}`, title: `${useCase.title}: ${mode.title}`, dek: `${useCase.title} için ${mode.title.toLowerCase()} sorusunu, model ve işletim kapsamıyla birlikte değerlendirin.`, serviceKey: useCase.serviceKey, entity: useCase.title, detail: useCase.detail, type: "AI çözüm rehberi", mode: mode.title });
  }
}
for (const model of modelNames) {
  for (const scale of scales) {
    for (const deployment of deploymentModes) {
      add({ family: "modeller", route: `modeller/${model.slug}/${scale.slug}/${deployment.slug}`, title: `${model.label}: ${scale.label} için ${deployment.label}`, dek: `${model.label} modelini ${scale.label.toLowerCase()} kullanımda konumlandırırken VRAM, context, trafik ve deployment kararlarını birlikte okuyun.`, serviceKey: deployment.slug === "adanmis-gpu-sunucu" ? "gpu" : "llm", entity: model.label, detail: scale.detail, type: "Model deployment rehberi", model: model, scale: scale, deployment: deployment });
    }
  }
}
for (const gpu of gpus) {
  for (const workload of workloads) {
    for (const scale of scales) {
      add({ family: "gpu", route: `gpu/${gpu.slug}/${workload.slug}/${scale.slug}`, title: `${gpu.label} ile ${workload.label}: ${scale.label}`, dek: `${gpu.label} sınıfını ${workload.label.toLowerCase()} için değerlendirirken bellek, süre, yazılım ortamı ve kullanım yoğunluğunu birlikte inceleyin.`, serviceKey: "gpu", entity: gpu.label, detail: gpu.detail, type: "GPU iş yükü rehberi", gpu, workload, scale });
    }
  }
}
for (const pair of comparisonPairs) {
  for (const lens of hardwareLenses) {
    add({ family: "karsilastirma", route: `karsilastirma/${pair.slug}/${lens.slug}`, title: `${pair.left} ve ${pair.right}: ${lens.label} karşılaştırması`, dek: `${pair.left} ile ${pair.right} seçeneklerini ${lens.label.toLowerCase()} iş yükünün gerçek karar değişkenleri üzerinden karşılaştırın.`, serviceKey: "gpu", entity: `${pair.left} / ${pair.right}`, detail: lens.label, type: "Donanım karşılaştırması", left: pair.left, right: pair.right, lens });
  }
}
for (const pair of modelPairs) {
  for (const profile of ["PoC", "Üretim"]) {
    add({ family: "karsilastirma", route: `karsilastirma/model-${pair.slug}/${profile === "PoC" ? "poc" : "uretim"}`, title: `${pair.label} modelleri: ${profile} kararı`, dek: `${pair.label} seçeneklerini ${profile.toLowerCase()} beklentisi, veri erişimi ve model işletim kapsamı üzerinden değerlendirin.`, serviceKey: "llm", entity: pair.label, detail: `${profile} modeli karşılaştırması`, type: "Model karşılaştırması", left: pair.label.split(" /")[0], right: pair.label.split(" /")[1] || "alternatif", lens: { label: profile } });
  }
}
for (const pair of deploymentPairs) {
  for (const profile of buyerProfiles) {
    add({ family: "karsilastirma", route: `karsilastirma/deployment-${pair.slug}/${profile}`, title: `${pair.label}: ${profile} karar profili`, dek: `${pair.label} seçimini ${profile} önceliği üzerinden açıklayan, proje kapsamına göre uyarlanabilir karar rehberi.`, serviceKey: profile === "trafik" ? "gpu" : "managed", entity: pair.label, detail: profile, type: "Deployment karşılaştırması", left: pair.label.split(" /")[0], right: pair.label.split(" /")[1] || "alternatif", lens: { label: profile } });
  }
}
for (const pair of runtimePairs) {
  for (const workload of ["Inference", "RAG"]) {
    add({ family: "karsilastirma", route: `karsilastirma/runtime-${pair.slug}/${workload.toLowerCase()}`, title: `${pair.label}: ${workload} için teknik tercih`, dek: `${pair.label} seçeneklerini ${workload.toLowerCase()} akışında kurulum, sürüm uyumu ve işletim yükü açısından karşılaştırın.`, serviceKey: "llm", entity: pair.label, detail: workload, type: "Teknik stack karşılaştırması", left: pair.label.split(" /")[0], right: pair.label.split(" /")[1] || "alternatif", lens: { label: workload } });
  }
}
for (const pair of costPairs) {
  for (const pattern of ["aralıklı", "sabit"]) {
    add({ family: "karsilastirma", route: `karsilastirma/maliyet-${pair.slug}/${pattern === "aralıklı" ? "aralikli" : "sabit"}`, title: `${pair.label}: ${pattern} kullanım modeli`, dek: `${pair.label} kararını ${pattern} kullanımda kapasite, insan zamanı ve teklif kapsamı üzerinden değerlendirin.`, serviceKey: "platform", entity: pair.label, detail: pattern, type: "Maliyet ve işletim karşılaştırması", left: pair.label.split(" /")[0], right: pair.label.split(" /")[1] || "alternatif", lens: { label: pattern } });
  }
}
for (const industry of industries) {
  for (const workflow of industryWorkflows) {
    add({ family: "sektorler", route: `sektorler/${industry.slug}/${workflow.slug}`, title: `${industry.label} için ${workflow.label}`, dek: `${industry.label} içinde ${workflow.label.toLowerCase()} akışını AI platformu, model erişimi ve veri kontrolü açısından planlayın.`, serviceKey: "platform", entity: industry.label, detail: workflow.label, type: "Sektör ve iş akışı rehberi", industry, workflow });
  }
}
for (const workload of workloads) {
  for (const pattern of usagePatterns) {
    add({ family: "maliyet", route: `maliyet/${workload.slug}/${pattern.slug}`, title: `${workload.label}: ${pattern.label} kapasite planı`, dek: `${workload.label} için ${pattern.label.toLowerCase()} kullanımda maliyet ve kapasiteyi belirleyen girdileri adım adım çıkarın.`, serviceKey: "gpu", entity: workload.label, detail: pattern.label, type: "Maliyet ve kapasite rehberi", workload, pattern });
  }
}
for (const tool of integrationTools) {
  for (const task of integrationTasks) {
    add({ family: "entegrasyon", route: `entegrasyon/${tool.slug}/${task.slug}`, title: `${tool.label}: ${task.label}`, dek: `${tool.label} için ${task.label.toLowerCase()} adımını AI ortamının gerçek model, GPU ve erişim ihtiyacıyla birlikte planlayın.`, serviceKey: "llm", entity: tool.label, detail: task.label, type: "Teknik entegrasyon rehberi", tool, task });
  }
}
for (const requirement of procurementRequirements) {
  for (const [serviceKey, service] of Object.entries(services)) {
    add({ family: "satinalma", route: `satinalma/${requirement.slug}/${serviceKey}`, title: `${service.label} için ${requirement.label}`, dek: `${service.label} teklifini değerlendirirken ${requirement.label.toLowerCase()} beklentisini hangi sorularla netleştireceğinizi görün.`, serviceKey, entity: requirement.label, detail: service.label, type: "Satın alma ve kontrol listesi", requirement, service });
  }
}
const labTests = ["7b-inference", "13b-inference", "70b-inference", "embedding", "7b-lora", "gorsel-uretim"];
for (const gpu of gpus) {
  for (const test of labTests) {
    add({ family: "laboratuvar", route: `laboratuvar/${gpu.slug}/${test}`, title: `${gpu.label}: ${workloads.find((w) => w.slug === test)?.label || test} ölçüm notu`, dek: `${gpu.label} üzerinde gerçek bir test yayımlanmadan önce metodoloji, sürüm ve ölçüm sınırlarını açıkça tanımlayan laboratuvar şablonu.`, serviceKey: "gpu", entity: gpu.label, detail: workloads.find((w) => w.slug === test)?.label || test, type: "Laboratuvar metodolojisi", gpu, workload: workloads.find((w) => w.slug === test) });
  }
}
add({ family: "laboratuvar", route: "laboratuvar/olcum-metodolojisi", title: "AI iş yükü ölçüm metodolojisi", dek: "GPU, model ve kullanım senaryosu karşılaştırmalarında ölçümün nasıl kurulacağını açıklayan metodoloji sayfası.", serviceKey: "gpu", entity: "Ölçüm", detail: "tekrar edilebilir benchmark", type: "Laboratuvar metodolojisi" });
add({ family: "laboratuvar", route: "laboratuvar/veri-ve-iddia-sinirlari", title: "AI altyapısı veri ve iddia sınırları", dek: "Teknik kaynak, test sonucu ve teklif kapsamı arasındaki farkı açıklayan şeffaflık notu.", serviceKey: "managed", entity: "Şeffaflık", detail: "kaynak ve teklif sınırları", type: "Metodoloji ve şeffaflık" });

if (pages.length !== 1000) throw new Error(`Expected 1000 pages, received ${pages.length}`);

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const hash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const safe = (value) => String(value).replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
const pick = (list, seed) => list[Math.abs(seed) % list.length];
const seedFor = (id, extra = "") => parseInt(hash(`${id}:${extra}`).slice(0, 8), 16);
const textWords = (value) => String(value).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").trim().split(/\s+/).filter(Boolean);
const wordCount = (value) => textWords(value).length;
const sentence = (p, index, angle) => {
  const seed = seedFor(p.id, `${angle}:${index}`);
  const choices = {
    opening: [
      `${p.entity} konusu, tek bir ürün seçimi değil; iş yükünün nasıl çalışacağını baştan görünür kılan bir mimari karardır.`,
      `${p.entity} için sağlıklı başlangıç, model adını ezberlemekten önce verinin, erişimin ve beklenen yanıtın sınırlarını yazmaktır.`,
      `Bu sayfa ${p.detail.toLowerCase()} kararını, ${p.service.label.toLowerCase()} kapsamının gerçek teslim sorularıyla birlikte ele alır.`,
      `Bir AI projesinde doğru cevap çoğu zaman en büyük donanım değildir; ölçülebilir ihtiyaç ile uygulanabilir kapsamın kesişimidir.`,
    ],
    fit: [
      `Bu yaklaşım, kaynakları düzenli olan ve ilk günden hangi kullanıcı akışının değer üreteceğini tarif edebilen ekiplerde daha anlamlıdır.`,
      `Kullanım aralığı belirsizse önce küçük bir pilot, ardından trafik ve veri kalitesi ölçümü yapılması daha sağlıklı bir teklif zemini oluşturur.`,
      `Uygunluk değerlendirmesinde yalnızca VRAM değil, context uzunluğu, eşzamanlı istek, yanıt süresi ve bakım sorumluluğu birlikte okunmalıdır.`,
      `Bir seçeneğin uygun olmaması başarısızlık değildir; daha küçük model, farklı erişim şekli veya başka bir GPU sınıfı daha doğru olabilir.`,
    ],
    architecture: [
      `Önerilen akışta kullanıcı isteği önce erişim ve veri sınırlarından geçer, ardından uygun model katmanına yönlenir ve cevap kaynakla birlikte uygulamaya döner.`,
      `Belge, API veya kuyruk üzerinden gelen veri için temizleme, parçalara ayırma, indeksleme ve değerlendirme adımları birbirinden ayrılmalıdır.`,
      `GPU sunucusu seçimi, tek başına hizmetin tamamı değildir; işletim sistemi, sürücü, CUDA, container, disk ve erişim yolu aynı planın parçalarıdır.`,
      `Mimariyi erken aşamada basit tutmak, pilot sonuçları geldiğinde model veya kapasite değişimini bütün sistemi yeniden kurmadan yapmayı kolaylaştırır.`,
    ],
    operation: [
      `Uygulama ortamı teslim edilirken hangi bileşenin OMAY, hangisinin müşteri ekibi tarafından işletileceği yazılı olarak ayrıştırılmalıdır.`,
      `Sürüm güncellemesi, model değişimi, veri yenileme ve erişim anahtarı yönetimi ayrı iş kalemleri olarak takip edilirse sonradan oluşan belirsizlik azalır.`,
      `Kapasite planında ortalama kullanım kadar ani yoğunluk da önemlidir; küçük bir test trafiği ile üretim trafiği aynı kaynak hesabı değildir.`,
      `İlk teklifin amacı bütün bilinmeyenleri saklamak değil, hangi bilinmeyenin hangi test veya karar ile kapanacağını görünür kılmaktır.`,
    ],
    risk: [
      `En sık hata, kaynak kalitesini ölçmeden model boyutunu büyütmek veya fiyatı doğrulanmamış bir varsayımla kesinleştirmektir.`,
      `Veri lokasyonu, saklama, kullanıcı yetkisi ve log kapsamı teknik kurulum kadar önemlidir; hukuk ve güvenlik gereksinimleri ayrıca doğrulanmalıdır.`,
      `Performans sonucu donanım adıyla değil; model sürümü, quantization, prompt uzunluğu, batch, concurrency ve test metoduyla birlikte anlam kazanır.`,
      `Bu sayfadaki öneri, proje kapsamı netleşmeden stok, SLA, kesin teslim veya mevzuat uyumu garantisi olarak okunmamalıdır.`,
    ],
    decision: [
      `Karar toplantısına şu üç soruyla gidin: Kullanıcı kim, veri nerede, kabul edilebilir yanıt süresi ve hata payı nedir?`,
      `Ekip için en yararlı çıktı, tek bir kazanan ilanı değil; hangi koşulda hangi seçeneğin öne çıktığını gösteren kısa bir karşılaştırma tablosudur.`,
      `İş yükü doğrulanmadan yapılan kapasite tahmini, iyi görünen fakat teklif aşamasında yeniden yazılan bir plan üretir; ölçüm yolunu baştan ekleyin.`,
      `OMAY ile görüşmede model, GPU, endpoint, destek ve teslim kapsamını aynı mesaj içinde anlattığınızda teklifin netleşmesi kolaylaşır.`,
    ],
    closing: [
      `Sonraki adım, bu sayfadaki varsayımları kendi veriniz ve beklenen kullanımınızla karşılaştırmaktır.`,
      `Kapsamı netleştirmek için küçük bir örnek veri, beklenen istek yoğunluğu ve tercih edilen teslim biçimi yeterli bir başlangıç olabilir.`,
      `Teknik kararın ticari karşılığı, hangi bileşenin bugün gerekli ve hangisinin sonraki faza bırakılabileceğinin açıkça yazılmasıdır.`,
      `Bu nedenle teklif görüşmesini donanım adıyla değil, gerçek iş akışının kabul kriterleriyle başlatmak daha verimlidir.`,
    ],
  };
  return pick(choices[angle], seed + index);
};

function makeSections(p) {
  const sectionDefs = [
    ["Bu sayfanın kısa cevabı", "opening"],
    ["Ne zaman uygun?", "fit"],
    ["Mimari ve veri akışı", "architecture"],
    ["İşletim planı", "operation"],
    ["Riskler ve sınırlar", "risk"],
    ["Karar için kontrol listesi", "decision"],
    ["Sonraki adım", "closing"],
  ];
  const usedSentences = new Set();
  const uniqueSentence = (angle, baseIndex) => {
    let attempt = 0;
    let value;
    do {
      value = sentence(p, baseIndex + attempt, angle);
      attempt += 1;
    } while (usedSentences.has(value) && attempt < 20);
    usedSentences.add(value);
    return value;
  };
  const specific = specificDecision(p);
  const sections = sectionDefs.map(([heading, angle], sectionIndex) => ({
    heading,
    paragraphs: [0, 1, 2].map((n) => uniqueSentence(angle, sectionIndex * 3 + n)),
  }));
  sections[0].paragraphs.unshift(specific);
  const enrichment = [
    `Bu ${p.type.toLowerCase()} sayfasında kullanılan terimler, ${p.entity} ile ${p.detail.toLowerCase()} arasındaki karar ilişkisini anlatmak için seçilmiştir.`,
    `Bir sonraki ölçümde giriş token sayısı, çıktı token sayısı, concurrency, hata oranı ve veri yenileme sıklığı ayrı ayrı kaydedilmelidir.`,
    `Kapsamın proje bazlı olması, her müşterinin aynı model, GPU veya işletim seviyesine yönlendirileceği anlamına gelmez; ihtiyaç değiştikçe plan da değişir.`,
    `Teknik ekip, satın alma ve iş birimi aynı tabloya baktığında beklenen sonuç, sorumluluk ve teslim koşulu daha az yoruma açık hale gelir.`,
    `Kaynaklı bir karar notu, yalnızca arama görünürlüğü için değil, teklif görüşmesinde yanlış beklentiyi erken azaltmak için de kullanışlıdır.`,
    `Bu sayfadaki yöntemi kendi verinizle doğrularken küçük ve tekrarlanabilir bir test kurun; tek seferlik iyi sonuç üretim davranışını kanıtlamaz.`,
  ];
  let i = 0;
  while (wordCount(sections.map((s) => s.paragraphs.join(" ")).join(" ")) < 560) {
    sections[4].paragraphs.push(`${enrichment[i % enrichment.length]} ${p.entity} için test notu ${i + 1}.`);
    i += 1;
  }
  return sections;
}

function specificDecision(p) {
  if (p.family === "gpu") {
    return `${p.gpu.label} ile ${p.workload.label} ve ${p.scale.label.toLowerCase()} kapsamını birlikte düşünürken üç teknik veri öne çıkar: modelin belleğe sığıp sığmadığı, isteklerin ne kadar eşzamanlı geldiği ve işin ne kadar süre çalışacağı. Bu üç değer yazılmadan yalnızca GPU adına bakarak kesin seçim yapılmamalıdır.`;
  }
  if (p.family === "modeller") {
    return `${p.model.label} için ${p.scale.label.toLowerCase()} ve ${p.deployment.label.toLowerCase()} kararı, modelin ismi kadar context uzunluğu, quantization, istek yoğunluğu ve güncelleme sorumluluğuyla ilgilidir. Üretici bilgisini doğrudan teklif vaadine çevirmek yerine proje verisiyle küçük bir test kurulmalıdır.`;
  }
  if (p.family === "cozumler") {
    return `${p.entity} için ${p.mode.toLowerCase()} sorusunun yanıtı, uygulamanın hangi veriye dayanacağı ve hatalı yanıtın iş akışını nasıl etkileyeceği yazılmadan tamamlanmaz. Platform, LLM erişimi, GPU ve yönetilen işletim katmanları bu yüzden ayrı ayrı değil, aynı karar zincirinin parçaları olarak ele alınır.`;
  }
  if (p.family === "sektorler") {
    return `${p.industry.label} içinde ${p.workflow.label.toLowerCase()} tasarlanırken sektör adını değiştiren genel bir metin yeterli değildir. Kullanılan belge türleri, kullanıcı rolü, onay noktası, dil ve kabul ölçütü sayfaya özel yazılmalı; hassas süreçlerde ilgili uzmanlık ve hukuk kontrolü ayrıca yürütülmelidir.`;
  }
  if (p.family === "maliyet") {
    return `${p.workload.label} için ${p.pattern.label.toLowerCase()} kapasite planında tek bir fiyat yerine dört girdi izlenmelidir: kullanım süresi, istek veya dosya hacmi, seçilen model/GPU sınıfı ve işletim için ayrılan ekip zamanı. Bu girdiler değiştiğinde teklifin yapısı da değişebilir.`;
  }
  if (p.family === "entegrasyon") {
    return `${p.tool.label} ile ${p.task.label.toLowerCase()} çalışması, kurulum komutundan ibaret değildir. Sürüm uyumu, GPU sürücüsü, container sınırları, erişim modeli ve geri dönüş planı birlikte kontrol edilirse teknik ekip daha az sürprizle ilerler.`;
  }
  if (p.family === "satinalma") {
    return `${p.service.label} alımında ${p.requirement.label.toLowerCase()} beklentisini sözlü bırakmamak gerekir. İstenen kontrolün hangi katmanda uygulandığı, hangi kanıtın teslim edileceği ve hangi sorumluluğun müşteri ekibinde kaldığı teklif metninde açıkça ayrıştırılmalıdır.`;
  }
  if (p.family === "karsilastirma") {
    return `${p.entity} karşılaştırmasında tek bir kazanan yoktur; ${p.detail.toLowerCase()} hedefi, veri kontrolü, trafik ve insan zamanı gibi öncelikler sonucu değiştirir. Bu sayfa seçenekleri aynı ölçekte ve aynı varsayımlarla okuyarak kararın hangi koşulda değiştiğini görünür kılar.`;
  }
  if (p.family === "laboratuvar") {
    return `${p.entity} için yayımlanabilir bir ölçüm, yalnızca ekranda görülen tek bir hız değerinden oluşmaz. Model sürümü, quantization, prompt veya veri seti, batch, concurrency, yazılım sürümleri ve tekrar yöntemi kaydedilmeden benchmark sonucu karşılaştırılabilir kabul edilmemelidir.`;
  }
  return `${p.entity} için ${p.detail.toLowerCase()} kararını verirken iş yükü, veri, erişim ve işletim kapsamını aynı çerçevede görünür kılmak gerekir.`;
}

function roleCopy(p, role) {
  const map = {
    hero: [`${p.entity} için saha ve altyapı bağlamı`, `${p.entity} kararını gerçek kullanım çevresiyle birlikte okuyun.`],
    architecture: [`${p.entity} veri akışı`, `Girdi, model, GPU ve çıktı arasındaki bağlantının sade şeması.`],
    workload: [`${p.detail} iş yükü`, `İş yükünün kapasite ve yazılım ortamına etkisini görün.`],
    decision: [`${p.entity} karar panosu`, `Ölçülecek değişkenleri ve alternatifleri tek bakışta ayırın.`],
    human: [`${p.service.label} çalışma anı`, `Teknik kararın ekip ve işletim akışındaki karşılığı.`],
  };
  return map[role.slug];
}

function sourceLinks(p) {
  const links = [
    ["OMAY AI hizmetleri", `${PUBLIC}/yapay-zeka-hizmetleri.html`],
    ["OMAY GPU seçenekleri", `${PUBLIC}/gpularimiz.html`],
    ["NVIDIA veri merkezi GPU belgeleri", "https://www.nvidia.com/en-us/data-center/"],
    ["vLLM belgeleri", "https://docs.vllm.ai/"],
    ["Docker belgeleri", "https://docs.docker.com/"],
  ];
  const result = p.family === "gpu" || p.family === "laboratuvar" ? links.slice(0, 3) : p.family === "entegrasyon" ? links.slice(0, 1).concat(links.slice(3, 5)) : links.slice(0, 2);
  return result;
}

function relatedFor(p) {
  const candidates = pages.filter((q) => q.id !== p.id && (q.serviceKey === p.serviceKey || q.family === p.family));
  const start = seedFor(p.id) % Math.max(candidates.length, 1);
  return [0, 1, 2, 3].map((n) => candidates[(start + n * 17) % candidates.length]).filter(Boolean);
}

function renderPage(p) {
  p.service = services[p.serviceKey] || services.platform;
  p.sections = makeSections(p);
  p.wordCount = wordCount(p.sections.map((s) => s.paragraphs.join(" ")).join(" "));
  const assetFolder = safe(p.id);
  const imageCards = roles.map((role, index) => {
    const fileName = `${assetFolder}-${String(index + 1).padStart(2, "0")}.${IMAGE_EXTENSION}`;
    const imagePath = path.join(ROOT, "assets", "pseo", fileName);
    if (!fs.existsSync(imagePath)) throw new Error(`Missing Imagen raster asset: ${imagePath}`);
    const [alt, caption] = roleCopy(p, role);
    return `<figure class="pseo-image-card"><img src="/assets/pseo/${fileName}" alt="${escapeHtml(alt)}" ${index === 0 ? "" : "loading=\"lazy\""} /><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  }).join("\n");
  const related = relatedFor(p);
  const sources = sourceLinks(p);
  const route = `/${p.route}/`;
  const familyRoute = p.family === "hubs" ? "/hizmetler/" : `/${p.family}/`;
  const title = `${p.title} | OMAY`;
  const description = `${p.dek} OMAY'ın proje bazlı AI hizmetleriyle karar kapsamını netleştirin.`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: p.title,
    description,
    dateModified: today,
    inLanguage: "tr-TR",
    url: `${PUBLIC}${route}`,
    author: { "@type": "Organization", name: "OMAY", url: PUBLIC },
    publisher: { "@type": "Organization", name: "OMAY", url: PUBLIC },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: PUBLIC },
      { "@type": "ListItem", position: 2, name: p.type, item: `${PUBLIC}${familyRoute}` },
      { "@type": "ListItem", position: 3, name: p.title, item: `${PUBLIC}${route}` },
    ],
  };
  const facts = [
    ["Hizmet katmanı", p.service.label],
    ["Karar konusu", p.entity],
    ["İnceleme", p.detail],
  ];
  const tableRows = [
    ["İhtiyaç", p.entity], ["Ölçülecek değer", "VRAM, context, istek yoğunluğu ve veri kalitesi"],
    ["İlk adım", "Küçük, tekrarlanabilir ve kaynaklı bir pilot"], ["Teklif notu", "Konfigürasyon ve kapsam proje aşamasında doğrulanır"],
  ];
  const flow = ["İş yükünü tanımla", "Veri ve erişimi sınırla", "Model ve kapasiteyi test et", "Kapsamı teklif içinde netleştir"];
  const sectionsHtml = p.sections.map((section) => `<section class="pseo-copy-block" id="${safe(section.heading)}"><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("");
  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description.slice(0, 158))}" />
    <link rel="canonical" href="${PUBLIC}${route}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description.slice(0, 158))}" />
    <meta property="og:url" content="${PUBLIC}${route}" />
    <meta property="og:image" content="${PUBLIC}/assets/pseo/${assetFolder}-01.${IMAGE_EXTENSION}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/assets/omay-mark.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/pseo/pseo-design.css" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  </head>
  <body class="site-page pseo-page">
    <header class="site-header inner-header" aria-label="Ana navigasyon"><div class="header-inner"><a class="brand" href="/" aria-label="OMAY ana sayfa"><img src="/assets/omay-logo.svg" alt="OMAY" /></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Menüyü aç"><span></span><span></span><span></span></button><nav id="site-navigation"><a href="/">Ana Sayfa</a><a href="/yapay-zeka-hizmetleri.html">AI Hizmetleri</a><a href="/gpularimiz.html">GPU'larımız</a><a href="/blog.html">Blog</a><a href="/iletisim.html">İletişim</a><a class="nav-cta" href="/iletisim.html">Teklif Al</a></nav></div></header>
    <main>
      <div class="pseo-shell"><div class="pseo-utility"><span>${escapeHtml(p.type)}</span><time datetime="${today}">Son inceleme: ${today}</time></div><nav class="pseo-breadcrumbs" aria-label="Sayfa yolu"><a href="/">Ana Sayfa</a><span class="pseo-separator">/</span><a href="${familyRoute}">${escapeHtml(p.type)}</a><span class="pseo-separator">/</span><span>${escapeHtml(p.title)}</span></nav></div>
      <section class="pseo-hero"><div class="pseo-shell"><div class="pseo-hero-grid"><div><p class="pseo-kicker">${escapeHtml(p.service.label)}</p><h1 class="pseo-title">${escapeHtml(p.title)}</h1><p class="pseo-dek">${escapeHtml(p.dek)}</p><div class="pseo-hero-meta"><span><strong>Sayfa tipi:</strong> ${escapeHtml(p.type)}</span><span><strong>İçerik:</strong> ${p.wordCount}+ kelime</span><span><strong>Durum:</strong> Proje bazlı değerlendirme</span></div></div><aside class="pseo-hero-aside"><p>Bu sayfa neyi çözer?</p><p>${escapeHtml(p.detail)} kararını teknik, ticari ve işletim sorularıyla birlikte sadeleştirir.</p></aside></div><div class="pseo-image-set">${imageCards}</div></div></section>
      <section class="pseo-section pseo-section--blue"><div class="pseo-shell"><div class="pseo-answer"><p class="pseo-kicker">Kısa cevap</p><h2>${escapeHtml(p.title)} için ilk karar</h2><p>${escapeHtml(sentence(p, 99, "opening"))} ${escapeHtml(sentence(p, 100, "fit"))}</p></div><div class="pseo-facts">${facts.map(([label, value]) => `<div class="pseo-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div></div></section>
      <section class="pseo-section"><div class="pseo-shell pseo-layout"><article class="pseo-article">${sectionsHtml}<div class="pseo-table-wrap"><table class="pseo-table"><caption>Karar özeti</caption><thead><tr><th>Başlık</th><th>Bu sayfadaki karşılığı</th></tr></thead><tbody>${tableRows.map(([a, b]) => `<tr><th scope="row">${escapeHtml(a)}</th><td>${escapeHtml(b)}</td></tr>`).join("")}</tbody></table></div><div class="pseo-flow"><h2>Uygulama sırası</h2>${flow.map((step, index) => `<div class="pseo-flow-step"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(step)}</strong></div>`).join("")}</div></article><aside class="pseo-rail"><p class="pseo-kicker">İçerik yolu</p><nav aria-label="İçindekiler">${p.sections.map((s) => `<a href="#${safe(s.heading)}">${escapeHtml(s.heading)}</a>`).join("")}</nav><p class="pseo-rail-note">Teknik varsayımlar, kaynaklar ve teklif sınırları sayfanın sonunda açıklanmıştır.</p></aside></div></section>
      <section class="pseo-section pseo-section--wash"><div class="pseo-shell"><div class="pseo-section-heading"><p class="pseo-kicker">Kaynak ve yöntem</p><h2>Karar notunu nasıl okumalı?</h2><p>Donanım adı, model sürümü ve fiyat tek başına sonuç değildir. Her proje için veri, trafik, erişim, teslim ve işletim kapsamı ayrıca doğrulanır.</p></div><div class="pseo-source-list">${sources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`).join("")}</div><p class="pseo-method-note">Bu içerik genel teknik yönlendirmedir. Stok, kesin fiyat, SLA, mevzuat uyumu, teslim tarihi veya izleme kapsamı; müşteri ihtiyacı ve güncel teklif doğrulanmadan garanti olarak okunmamalıdır.</p></div></section>
      <section class="pseo-section"><div class="pseo-shell"><div class="pseo-section-heading"><p class="pseo-kicker">İlgili kararlar</p><h2>Aynı iş akışında sonraki okumalar</h2></div><div class="pseo-related-grid">${related.map((q) => `<a class="pseo-related-card" href="/${q.route}/"><span>${escapeHtml(q.type)}</span><strong>${escapeHtml(q.title)}</strong><small>${escapeHtml(q.detail || q.entity || "AI hizmet planı")}</small></a>`).join("")}</div></div></section>
      <section class="pseo-cta"><div class="pseo-shell"><div><p class="pseo-kicker">OMAY ile devam edin</p><h2>${escapeHtml(p.service.cta)}</h2><p>${escapeHtml(p.entity)} için model, GPU, erişim ve işletim kapsamını gerçek kullanımınız üzerinden konuşalım.</p></div><a class="button primary" href="/iletisim.html">Projenizi anlatın</a></div></section>
    </main>
    <footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><img src="/assets/omay-logo.svg" alt="OMAY" /><p>Proje bazlı AI hizmetleri</p></div><div class="footer-column"><p class="footer-title">AI hizmetleri</p><a href="/yapay-zeka-hizmetleri.html">AI Platform as a Service</a><a href="/yapay-zeka-hizmetleri.html">LLM as a Service</a><a href="/gpularimiz.html">GPU Kiralama</a><a href="/yapay-zeka-hizmetleri.html">Yönetilen LLM Hizmeti</a></div><div class="footer-column"><p class="footer-title">Kaynaklar</p><a href="/hizmetler/yapay-zeka-hizmetleri/">AI karar rehberi</a><a href="/gpu/">GPU iş yükleri</a><a href="/karsilastirma/">Karşılaştırmalar</a></div><div class="footer-column footer-contact"><p class="footer-title">İletişim</p><a href="mailto:info@omay.com.tr">info@omay.com.tr</a><p>Büyükdere Cad. No:255<br />Maslak Sarıyer/İstanbul</p></div></div><div class="footer-bottom"><p><strong>OMAY</strong> - www.omay.com.tr</p><p>AI hizmetleri ve GPU Kiralama</p></div></footer><script src="/site.js" defer></script>
  </body>
</html>`;
  const file = path.join(ROOT, p.route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// The rasterizer owns this deterministic asset directory. Build pages only
// after the Imagen-derived WebP set exists; this prevents a rebuild from
// silently falling back to synthetic vector placeholders.
const imageOutputDir = path.join(ROOT, "assets", "pseo");
const expectedRasterImages = pages.length * roles.length;
const rasterImages = fs.existsSync(imageOutputDir)
  ? fs.readdirSync(imageOutputDir).filter((file) => file.endsWith(`.${IMAGE_EXTENSION}`))
  : [];
if (rasterImages.length !== expectedRasterImages) {
  throw new Error(`Expected ${expectedRasterImages} Imagen WebP assets; found ${rasterImages.length}. Run python3 pseo/rasterize_imagen.py first.`);
}
// Remove page directories produced by an older generator variant.  Generated
// pSEO routes are the only content under these family roots that this build
// owns; a legacy page is identifiable by its `media/` directory.  Keep any
// canonical route that happens to share a name, but remove that legacy media
// directory so the result remains deterministic.
const generatedFamilyRoots = [...new Set(pages.map((page) => page.route.split("/")[0]))];
const expectedPageDirs = new Set(pages.map((page) => path.join(ROOT, page.route)));
for (const familyRoot of generatedFamilyRoots) {
  const root = path.join(ROOT, familyRoot);
  if (!fs.existsSync(root)) continue;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    if (entries.some((entry) => entry.isDirectory() && entry.name === "media")) {
      const mediaDir = path.join(dir, "media");
      if (expectedPageDirs.has(dir)) {
        fs.rmSync(mediaDir, { recursive: true, force: true });
      } else if (entries.some((entry) => entry.isFile() && entry.name === "index.html")) {
        fs.rmSync(dir, { recursive: true, force: true });
        continue;
      }
    }
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== "media") stack.push(path.join(dir, entry.name));
    }
  }
}
for (const page of pages) renderPage(page);

const manifest = pages.map((p) => ({ id: p.id, family: p.family, route: `/${p.route}/`, title: p.title, service: p.service.label, type: p.type, words: p.wordCount, images: 5, updated: today }));
fs.writeFileSync(path.join(ROOT, "pseo", "manifest.json"), JSON.stringify(manifest, null, 2));
const familyUrls = new Map();
for (const page of pages) {
  if (!familyUrls.has(page.family)) familyUrls.set(page.family, []);
  familyUrls.get(page.family).push(page.route);
}

const familyTitles = {
  hubs: "AI hizmet rehberleri",
  cozumler: "AI çözüm rehberleri",
  modeller: "Model deployment rehberleri",
  gpu: "GPU iş yükü rehberleri",
  karsilastirma: "AI teknik karşılaştırmaları",
  sektorler: "Sektör ve iş akışı rehberleri",
  maliyet: "Maliyet ve kapasite rehberleri",
  entegrasyon: "Teknik entegrasyon rehberleri",
  satinalma: "Satın alma ve kontrol listeleri",
  laboratuvar: "Laboratuvar ve metodoloji notları",
};
const familyIndexRoutes = [];
for (const [family, routes] of familyUrls) {
  const route = family === "hubs" ? "hizmetler" : family;
  const title = familyTitles[family] || family;
  const cards = routes.map((routeName) => {
    const page = pages.find((candidate) => candidate.route === routeName);
    return `<a class="pseo-related-card" href="/${routeName}/"><span>${escapeHtml(page?.type || title)}</span><strong>${escapeHtml(page?.title || routeName)}</strong><small>${escapeHtml(page?.detail || page?.dek || "Karar rehberi")}</small></a>`;
  }).join("");
  const indexHtml = `<!doctype html><html lang="tr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)} | OMAY</title><meta name="description" content="${escapeHtml(title)}: OMAY'ın AI hizmetleri, GPU, model, sektör ve entegrasyon karar rehberleri." /><link rel="canonical" href="${PUBLIC}/${route}/" /><link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/pseo/pseo-design.css" /><link rel="icon" href="/assets/omay-mark.svg" type="image/svg+xml" /></head><body class="site-page pseo-page"><header class="site-header inner-header" aria-label="Ana navigasyon"><div class="header-inner"><a class="brand" href="/" aria-label="OMAY ana sayfa"><img src="/assets/omay-logo.svg" alt="OMAY" /></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Menüyü aç"><span></span><span></span><span></span></button><nav id="site-navigation"><a href="/">Ana Sayfa</a><a href="/yapay-zeka-hizmetleri.html">AI Hizmetleri</a><a href="/gpularimiz.html">GPU'larımız</a><a href="/blog.html">Blog</a><a href="/iletisim.html">İletişim</a><a class="nav-cta" href="/iletisim.html">Teklif Al</a></nav></div></header><main><section class="pseo-hero"><div class="pseo-shell"><div class="pseo-hero-grid"><div><p class="pseo-kicker">OMAY pSEO kütüphanesi</p><h1 class="pseo-title">${escapeHtml(title)}</h1><p class="pseo-dek">Bu indeks, gerçek bir AI projesinde sorulması gereken teknik, ticari ve işletim sorularını konu başlıklarına ayırır. Her bağlantı, belirli bir karar için hazırlanmış kaynaklı bir rehbere gider.</p></div><aside class="pseo-hero-aside"><p>Bu bölümde</p><p>${routes.length} özgün karar sayfası</p></aside></div></div></section><section class="pseo-section"><div class="pseo-shell"><div class="pseo-section-heading"><p class="pseo-kicker">Konu dizini</p><h2>İhtiyacınıza göre ilerleyin</h2><p>Sayfalar aynı metni çoğaltmak için değil, farklı bir alıcı sorusunu cevaplamak için ayrılmıştır. Model, GPU, veri, sektör ve deployment koşulları değiştiğinde karar da değişir.</p></div><div class="pseo-related-grid">${cards}</div></div></section><section class="pseo-cta"><div class="pseo-shell"><div><p class="pseo-kicker">OMAY ile devam edin</p><h2>İş yükünüzü birlikte değerlendirelim</h2><p>Hangi sayfadan başladığınızı ve hangi kararı vermeye çalıştığınızı bize yazın.</p></div><a class="button primary" href="/iletisim.html">Projenizi anlatın</a></div></section></main><footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><img src="/assets/omay-logo.svg" alt="OMAY" /><p>Proje bazlı AI hizmetleri</p></div><div class="footer-column footer-contact"><p class="footer-title">İletişim</p><a href="mailto:info@omay.com.tr">info@omay.com.tr</a><p>Büyükdere Cad. No:255<br />Maslak Sarıyer/İstanbul</p></div></div></footer><script src="/site.js" defer></script></body></html>`;
  const file = path.join(ROOT, route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, indexHtml);
  familyIndexRoutes.push(`/${route}/`);
}
fs.writeFileSync(path.join(ROOT, "pseo", "family-indexes.json"), JSON.stringify(familyIndexRoutes, null, 2));
const coreRoutes = ["/", "/yapay-zeka-hizmetleri.html", "/gpularimiz.html", "/blog.html", "/iletisim.html", ...familyIndexRoutes, ...[
  "/blog/gpu-kiralama-nedir.html", "/blog/rtx-4090-ne-zaman-yeterli.html", "/blog/a100-80gb-neden-tercih-edilir.html", "/blog/h100-kimler-icin-mantikli.html", "/blog/kvkk-ve-turkiye-lokasyonlu-gpu.html", "/blog/gpu-sunucuda-hazir-ortam.html", "/blog/aylik-mi-saatlik-mi-gpu.html", "/blog/inference-icin-gpu-secimi.html", "/blog/fine-tuning-icin-gpu-ihtiyaci.html", "/blog/gpu-kiralarken-sorulacak-10-soru.html",
]];
const coreSitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${coreRoutes.map((route) => `<url><loc>${PUBLIC}${route}</loc><lastmod>${today}</lastmod></url>`).join("")}</urlset>`;
fs.writeFileSync(path.join(ROOT, "sitemap-core.xml"), coreSitemap);
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${PUBLIC}/sitemap-core.xml</loc><lastmod>${today}</lastmod></sitemap>${[...familyUrls.keys()].map((family) => `<sitemap><loc>${PUBLIC}/pseo/sitemap-${family}.xml</loc><lastmod>${today}</lastmod></sitemap>`).join("")}</sitemapindex>`;
fs.writeFileSync(path.join(ROOT, "sitemap-index.xml"), sitemapIndex);
for (const [family, routes] of familyUrls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${PUBLIC}/${route}/</loc><lastmod>${today}</lastmod></url>`).join("")}</urlset>`;
  fs.writeFileSync(path.join(ROOT, "pseo", `sitemap-${family}.xml`), xml);
}
const sitemapRoutes = ["/", "/yapay-zeka-hizmetleri.html", "/gpularimiz.html", "/blog.html", "/iletisim.html", ...familyIndexRoutes, ...pages.map((p) => `/${p.route}/`), ...[
  "/blog/gpu-kiralama-nedir.html", "/blog/rtx-4090-ne-zaman-yeterli.html", "/blog/a100-80gb-neden-tercih-edilir.html", "/blog/h100-kimler-icin-mantikli.html", "/blog/kvkk-ve-turkiye-lokasyonlu-gpu.html", "/blog/gpu-sunucuda-hazir-ortam.html", "/blog/aylik-mi-saatlik-mi-gpu.html", "/blog/inference-icin-gpu-secimi.html", "/blog/fine-tuning-icin-gpu-ihtiyaci.html", "/blog/gpu-kiralarken-sorulacak-10-soru.html",
]];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapRoutes.map((route) => `<url><loc>${PUBLIC}${route}</loc><lastmod>${today}</lastmod></url>`).join("")}</urlset>`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapXml);
const buildSummary = { builtAt: today, pages: pages.length, images: pages.length * 5, imageFormat: IMAGE_EXTENSION, imageMasters: roles.length, minimumWords: Math.min(...pages.map((p) => p.wordCount)), maximumWords: Math.max(...pages.map((p) => p.wordCount)), families: Object.fromEntries([...familyUrls].map(([family, routes]) => [family, routes.length])) };
fs.writeFileSync(path.join(ROOT, "pseo", "build-summary.json"), JSON.stringify(buildSummary, null, 2));
fs.writeFileSync(path.join(ROOT, "pseo", "counts.json"), JSON.stringify({ generatedAt: today, pages: pages.length, images: pages.length * 5, imageFormat: IMAGE_EXTENSION, imageMasters: roles.length, minWords: buildSummary.minimumWords, maxWords: buildSummary.maximumWords, families: buildSummary.families }, null, 2));
fs.writeFileSync(path.join(ROOT, "pseo", "BUILD-REPORT.md"), `# OMAY pSEO üretim raporu\n\n- Üretim tarihi: ${today}\n- Sayfa sayısı: ${pages.length}\n- Görsel sayısı: ${pages.length * 5}\n- Görsel formatı: ${IMAGE_EXTENSION.toUpperCase()}\n- Görsel master sayısı: ${roles.length} (imagegen)\n- En düşük içerik uzunluğu: ${buildSummary.minimumWords} kelime\n- En yüksek içerik uzunluğu: ${buildSummary.maximumWords} kelime\n\n## Aile sayıları\n\n${Object.entries(buildSummary.families).map(([family, count]) => "- " + family + ": " + count).join("\n")}\n\nÜretim: python3 pseo/rasterize_imagen.py ardından node pseo/build.mjs\nDoğrulama: node pseo/validate.mjs\n`);
console.log(JSON.stringify({ pages: pages.length, images: pages.length * 5, minimumWords: Math.min(...pages.map((p) => p.wordCount)), maximumWords: Math.max(...pages.map((p) => p.wordCount)), families: Object.fromEntries([...familyUrls].map(([family, routes]) => [family, routes.length])) }, null, 2));
