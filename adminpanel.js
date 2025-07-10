const client = supabase.createClient(
  "https://toxhhtbedgkhbpogiwrp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRveGhodGJlZGdraGJwb2dpd3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzY2MTIsImV4cCI6MjA2NzY1MjYxMn0.TXhql-C0rnAdn4QiqmS7_dOAWPwGbreVh2O5-DV0o6Q" // ← kendi anon key’inle değiştir
);

let guncellenenId = null;
let guncellenenDuyuruId = null;

function toggleMenu() {
  document.getElementById("menu").classList.toggle("active");
}

/* ----------------------------- ETKİNLİK ----------------------------- */

async function etkinlikEkle() {
  const sinif = document.getElementById("sinifSec").value;
  const baslik = document.getElementById("baslik").value.trim();
  const html = document.getElementById("htmlKod").value.trim();

  if (!sinif || !baslik || !html) {
    alert("⚠️ Lütfen tüm etkinlik alanlarını doldurun.");
    return;
  }

  if (guncellenenId) {
    const { error } = await client
      .from("etkinlikler")
      .update({ sinif, baslik, html })
      .eq("id", guncellenenId);

    if (error) {
      alert("❌ Güncelleme hatası: " + error.message);
    } else {
      alert("✅ Etkinlik güncellendi!");
      guncellenenId = null;
      document.getElementById("etkinlikFormu").reset();
      etkinlikleriListele();
    }
  } else {
    const { error } = await client
      .from("etkinlikler")
      .insert([{ sinif, baslik, html }]);

    if (error) {
      alert("❌ Ekleme hatası: " + error.message);
    } else {
      alert("✅ Etkinlik eklendi!");
      document.getElementById("etkinlikFormu").reset();
      etkinlikleriListele();
    }
  }
}

async function etkinlikleriListele() {
  const sinif = document.getElementById("listeSinif").value;
  let query = client.from("etkinlikler").select("*").order("id", { ascending: false });

  if (sinif) query = query.eq("sinif", sinif);

  const { data, error } = await query;
  const container = document.getElementById("listeAlani");
  container.innerHTML = "";

  if (error || !data) {
    container.textContent = "Veri alınamadı.";
    return;
  }

  if (data.length === 0) {
    container.textContent = "Etkinlik bulunamadı.";
    return;
  }

  data.forEach(item => {
    const kutu = document.createElement("div");
    kutu.className = "etkinlik-kutu";

    const baslik = document.createElement("h3");
    baslik.textContent = `${item.sinif}. Sınıf - ${item.baslik}`;

    const islemler = document.createElement("div");
    islemler.className = "islemler";

    const btnDuzenle = document.createElement("button");
    btnDuzenle.textContent = "Düzenle";
    btnDuzenle.onclick = () => duzenle(item.id, item.sinif, item.baslik, item.html);

    const btnTest = document.createElement("button");
    btnTest.textContent = "Test Et";
    btnTest.onclick = () => testEt(item.html);

    const btnSil = document.createElement("button");
    btnSil.textContent = "Sil";
    btnSil.onclick = () => silEtkinlik(item.id);

    islemler.appendChild(btnDuzenle);
    islemler.appendChild(btnTest);
    islemler.appendChild(btnSil);

    kutu.appendChild(baslik);
    kutu.appendChild(islemler);
    container.appendChild(kutu);
  });
}

function duzenle(id, sinif, baslik, htmlKod) {
  document.getElementById("sinifSec").value = sinif;
  document.getElementById("baslik").value = baslik;
  document.getElementById("htmlKod").value = htmlKod;
  guncellenenId = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function silEtkinlik(id) {
  if (confirm("Bu etkinliği silmek istiyor musunuz?")) {
    const { error } = await client.from("etkinlikler").delete().eq("id", id);
    if (!error) etkinlikleriListele();
    else alert("❌ Silme hatası: " + error.message);
  }
}

function testEt(htmlKod) {
  const pencere = window.open("", "_blank");
  pencere.document.open();
  pencere.document.write(htmlKod);
  pencere.document.close();
}

/* ----------------------------- DUYURU ----------------------------- */

async function duyuruEkle() {
  const baslik = document.getElementById("duyuruBaslik").value.trim();
  const tarih = document.getElementById("duyuruTarih").value;

  if (!baslik) {
    alert("⚠️ Duyuru başlığını yazmalısınız.");
    return;
  }

  if (guncellenenDuyuruId) {
    const { error } = await client
      .from("duyurular")
      .update({ baslik, tarih })
      .eq("id", guncellenenDuyuruId);

    if (error) {
      alert("❌ Güncelleme hatası: " + error.message);
    } else {
      alert("✅ Duyuru güncellendi!");
      guncellenenDuyuruId = null;
      document.getElementById("duyuruFormu").reset();
      duyurulariListele();
    }
  } else {
    const { error } = await client
      .from("duyurular")
      .insert([{ baslik, tarih }]);

    if (error) {
      alert("❌ Ekleme hatası: " + error.message);
    } else {
      alert("✅ Duyuru eklendi!");
      document.getElementById("duyuruFormu").reset();
      duyurulariListele();
    }
  }
}

async function duyurulariListele() {
  const { data, error } = await client
    .from("duyurular")
    .select("*")
    .order("tarih", { ascending: false });

  const container = document.getElementById("duyuruAlani");
  container.innerHTML = "";

  if (error || !data || data.length === 0) {
    container.textContent = "Henüz duyuru bulunamadı.";
    return;
  }

  data.forEach(item => {
    const kutu = document.createElement("div");
    kutu.className = "duyuru-kutu";

    const baslik = document.createElement("h3");
    baslik.textContent = item.baslik;

    const tarih = document.createElement("p");
    tarih.textContent = item.tarih ? `🗓️ ${item.tarih}` : "";

    const islemler = document.createElement("div");
    islemler.className = "islemler";

    const btnDuzenle = document.createElement("button");
    btnDuzenle.textContent = "Düzenle";
    btnDuzenle.onclick = () => duyuruDuzenle(item.id, item.baslik, item.tarih);

    const btnSil = document.createElement("button");
    btnSil.textContent = "Sil";
    btnSil.onclick = () => silDuyuru(item.id);

    islemler.appendChild(btnDuzenle);
    islemler.appendChild(btnSil);

    kutu.appendChild(baslik);
    kutu.appendChild(tarih);
    kutu.appendChild(islemler);
    container.appendChild(kutu);
  });
}

function duyuruDuzenle(id, baslik, tarih) {
  document.getElementById("duyuruBaslik").value = baslik;
  document.getElementById("duyuruTarih").value = tarih || "";
  guncellenenDuyuruId = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function silDuyuru(id) {
  if (confirm("Bu duyuruyu silmek istiyor musunuz?")) {
    const { error } = await client.from("duyurular").delete().eq("id", id);
    if (!error) duyurulariListele();
    else alert("❌ Silme hatası: " + error.message);
  }
}

/* ----------------------------- BAŞLAT ----------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  etkinlikleriListele();
  duyurulariListele();
});