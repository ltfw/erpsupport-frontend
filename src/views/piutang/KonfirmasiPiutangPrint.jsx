import axios from "axios";
import React, { useRef, forwardRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useParams, useNavigate } from "react-router-dom";
import { formatRupiah } from "../../utils/Number";

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL;
const cellStyle = {
  border: "1px solid black",
  padding: "8px",
  textAlign: "left"
};

export default function KonfirmasiPiutangPrint() {
  const { customerId } = useParams();
  console.log('ID : ', customerId)
  const navigate = useNavigate();
  const componentRef = useRef();

  const [dataHeader, setDataHeader] = useState(null);
  const [dataDetail, setDataDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Konfirmasi Piutang",
    pageStyle: `
      @page { size: A4 portrait; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; font-family: serif; line-height: 1.5}
      .page-break { page-break-before: always; }
      @media print {
        .avoid-page-break {
          break-inside: avoid;
          page-break-inside: avoid; /* for compatibility */
        }
      }
    `,
    onAfterPrint: () => navigate(-1),
  });

  // Fetch data from API
  useEffect(() => {
    Promise.all([
      axios.get(`${ENDPOINT_URL}piutang/konfirmasipiutang/header/${customerId}`),
      axios.get(`${ENDPOINT_URL}piutang/konfirmasipiutang/detail/${customerId}`)
    ]).then(([headerRes, detailRes]) => {
      console.log('headerRes: ', headerRes);

      setDataHeader(headerRes.data[0]);
      setDataDetail(detailRes.data);
      setIsLoading(false);
    });
  }, [customerId]);

  // Print when data is ready
  useEffect(() => {
    if (!isLoading) {
      handlePrint();
    }
  }, [isLoading, handlePrint]);

  const PrintTemplate = forwardRef((props, ref) => (
    <div ref={ref}>
      <img src="/img/logo-sdl.png" style={{ 
        position:"absolute",
        width:"120px",
        marginLeft:"10px"
      }}/>
      <div style={{ padding: "10px", fontSize:"12px" }}>
        <h2 style={{ textAlign: "center", textDecoration: "underline", marginBottom:"3rem", marginTop:"1rem" }}>KONFIRMASI PIUTANG</h2>

        <p>{props.Kota}, {props.tanggalSurat}</p>
        <p>
          Kepada Yang Terhormat,<br />
          {props.BusinessEntityName} {props.namaPenerima},<br />
          Di tempat,
        </p>

        <p>Dengan hormat,</p>
        <p>
          Sesuai dengan data Saldo Piutang Dagang <b>PT Satoria Distribusi Lestari</b> per tanggal {props.tanggalSurat},
          bahwa outlet Bapak/Ibu masih memiliki Saldo Hutang Dagang sebesar
          <b> Rp {formatRupiah(props.saldoHutang)}</b> kepada PT Satoria Distribusi Lestari.
        </p>

        <p>Adapun rincian sebagai berikut :</p>
        <table cellPadding="8" style={{
          width: "100%", 
          borderCollapse: "collapse",
          border: "1px solid black",
          fontSize:"12px"
        }}>
          <thead>
            <tr>
              <th style={cellStyle}>No</th>
              <th style={cellStyle}>No Faktur</th>
              <th style={cellStyle} className="text-center">Tgl Faktur</th>
              <th style={cellStyle} className="text-center">Jatuh Tempo</th>
              <th style={cellStyle} className="text-center">Umur</th>
              <th style={cellStyle} className="text-center">Nilai Piutang</th>
            </tr>
          </thead>
          <tbody>
            {props.rincian.map((row, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{idx + 1}</td>
                <td style={cellStyle}>{row.ParentTransaction}</td>
                <td style={cellStyle} className="text-center">{row.TglTrnFaktur}</td>
                <td style={cellStyle} className="text-center">{row.TglJthTmp}</td>
                <td style={cellStyle} className="text-center">{row.aging}</td>
                <td style={cellStyle} className="text-end">{formatRupiah(row.nominal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5">
          Atas dasar hal tersebut, kami hendak melakukan konfirmasi kesesuaian data Saldo Piutang Dagang kami
          dengan catatan pembukuan Bapak/Ibu.<br />
          <i>(Catatan : hal ini sifatnya hanya merupakan konfirmasi bukan penagihan)</i>
        </p>
          
        <div className="avoid-page-break">
          <p>Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan banyak terima kasih.</p>
          <p className="text-end mb-5">Hormat Kami,</p>
          <p className="text-end">Tim AR Control</p>
        </div>

        <div className="page-break" />

        <p>
          Kepada:<br />
          Internal Auditor<br />
          PT. Satoria Distribusi Lestari<br />
          Di Tempat
        </p>

        <p>
          Bersama ini kami menyatakan kepada PT Satoria Distribusi Lestari per tanggal ___________
          bahwa kami mempunyai Saldo Hutang Dagang sebesar Rp. _________________________
        </p>

        <p>Penjelasan :</p>
        <div style={{ minHeight: "150px", border: "1px solid #000", marginBottom: "20px" }}></div>

        <p>Hormat kami,</p>
        <br /><br /><br />
        <p>…………………………………<br />
          Nama Lengkap :<br />
          No Telp  :<br />
          Metode Pembayaran : Tunai / Transfer / Giro / Cek
        </p>
      </div>
    </div>
  ));

  if (isLoading) return null;

  return (
    <div style={{ display: "none" }}>
      <PrintTemplate
        ref={componentRef}
        tanggalSurat={dataHeader.tanggalSurat}
        Kota={dataHeader.Kota}
        namaPenerima={dataHeader.namaPenerima}
        saldoHutang={dataHeader.saldoHutang}
        rincian={dataDetail}
        BusinessEntityName={dataHeader.BusinessEntityName}
      />
    </div>
  );
}
