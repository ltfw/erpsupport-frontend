import axios from "axios";
import React, { useRef, forwardRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useParams, useNavigate } from "react-router-dom";
import { formatRupiah } from "../../utils/Number";

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL;
const cellStyle = {
  border: "1px solid black",
  padding: "4px",
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
      @page { 
        size: A4 portrait;
        margin: 0;
        padding: 0;
        margin-top: 50px;
        margin-bottom: 50px;
      }
      body { 
        -webkit-print-color-adjust: exact; 
        font-family: Arial, sans-serif; 
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
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
      {/* <img src="/img/accent.png" style={{ 
        position:"fixed",
        top:"0",
        left:"0",
        width:"300px",
        opacity:"0.3",
        zIndex: "-1"
      }}/> */}
      <img src="/img/logo-sdl.png" style={{
        position: "absolute",
        top: "0",
        // left:"0",
        right: "10px",
        marginRight: "50px",
        marginTop: "30px",
        width: "120px",
      }} />

      <div style={{ padding: "50px", fontSize: "12px" }}>
        <h2 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "3rem", marginTop: "1rem", zIndex: "1000" }}>
          KONFIRMASI PIUTANG
        </h2>

        <p style={{ zIndex: "1000" }}>{props.Kota}, {props.tanggalSurat}</p>
        <p style={{ zIndex: "1000" }}>
          Kepada Yang Terhormat,<br />
          {props.BusinessEntityName} {props.namaPenerima},<br />
          Di tempat,
        </p>

        <p style={{ zIndex: "1000" }}>Dengan hormat,</p>
        <p style={{ textIndent: "30px", textAlign: "justify" }}>
          Pertama-tama, kami mengucapkan terima kasih atas kerja sama yang telah terjalin dengan baik selama ini bersama
          PT Satoria Distribusi Lestari. Demi kenyamanan Bapak/Ibu dalam bertransaksi dengan PT Satoria Distribusi Lestari,
          bersama ini kami sampaikan daftar piutang {props.BusinessEntityName} {props.namaPenerima} per tanggal {props.tanggalSurat}.
        </p>
        <p style={{ textIndent: "30px" }}>
          Berdasarkan data kami, {props.BusinessEntityName} {props.namaPenerima} memiliki saldo hutang dagang sebesar <b>Rp {formatRupiah(props.saldoHutang)} </b>
          kepada PT Satoria Distribusi Lestari. Berikut adalah rinciannya :</p>
        <div style={{ display: "flex", justifyContent: "left" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid black",
            fontSize: "12px"
          }}>
            <thead>
              <tr>
                <th style={cellStyle} className="text-center">No</th>
                <th style={cellStyle} width="130px" className="text-center">No Faktur</th>
                <th style={cellStyle} width="100px" className="text-center">Tgl Faktur</th>
                <th style={cellStyle} width="115px" className="text-center">Nilai Piutang</th>
                <th style={cellStyle} width="100px" className="text-center">Jatuh Tempo</th>
                <th style={cellStyle} width="70px" className="text-center">Overdue</th>
                <th style={cellStyle} className="text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {props.rincian.map((row, idx) => (
                <tr key={idx}>
                  <td style={cellStyle} className="text-center">{idx + 1}</td>
                  <td style={cellStyle} className="text-center">{row.ParentTransaction}</td>
                  <td style={cellStyle} className="text-center">{row.TglTrnFaktur}</td>
                  <td style={cellStyle} className="text-end">{formatRupiah(row.nominal)}</td>
                  <td style={cellStyle} className="text-center">{row.TglJthTmp}</td>
                  <td style={cellStyle} className="text-center">{row.aging > 0 ? row.aging : '-'}</td>
                  <td style={cellStyle}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="avoid-page-break">
          <p className="mt-3" style={{ textIndent: "30px" }}>
            Atas dasar hal tersebut, kami hendak melakukan konfirmasi kesesuaian data Saldo Piutang Dagang kami
            dengan catatan pembukuan Bapak/Ibu. Mohon konfirmasinya dengan mengisi formulir di halaman terakhir.<br />
          </p>

          <p>Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan banyak terima kasih.</p>
          <p className="text-end mb-5">Hormat Kami,</p>
          <p className="text-end">Tim AR Control</p>
        </div>

        <div className="page-break" />

        <p style={{ zIndex: "1000" }}>
          Kepada:<br />
          Internal Auditor<br />
          PT. Satoria Distribusi Lestari<br />
          Di Tempat
        </p>

        <p style={{ zIndex: "1000" }}>
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
