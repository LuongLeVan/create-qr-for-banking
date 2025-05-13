import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import download from 'downloadjs';


const App = () => {
  /* Call list bank */
  const [data, setData] = useState([]);
  const [user, setUser] = useState();
  const [account, setAccount] = useState();
  const [money, setMoney] = useState();
  const [note, setNote] = useState();
  const [selectedBank, setSelectedBank] = useState(null);
  const [dataURL, setDataURL] = useState();
  const [contentCopy, setContentCopy] = useState();
  const [bankDesc, setBankDesc] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);


  useEffect(() => {
    axios
      .get("https://api.vietqr.io/v2/banks")
      .then((res) => {
        console.log(res.data.data);
        const data = res.data.data;
        setData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const generateQRCode = async () => {
    try {
      const response = await axios.post("https://api.vietqr.io/v2/generate", {
        accountNo: account,
        accountName: user,
        acqId: selectedBank?.value,
        amount: money,
        addInfo: note,
        format: "text",
        template: "print",
      });
      console.log("QR Code data:", response.data);
      console.log('select', selectedBank);
      
      const url = response.data.data.qrDataURL;
      setDataURL(url);
      setContentCopy(`${account} ${user} ${bankDesc.shortName} - ${bankDesc.name}`)
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleCopy = (textCopy) => {
    navigator.clipboard.writeText(textCopy)
    .then(() => alert('Copy thành công!'))
    .catch((err) => console.error('Lỗi copy:',err) );
  }

  const formatVND = (num) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };


  const downloadQR = () => {
    if (!dataURL) return;
    download(dataURL, 'qr-code.png', 'image/png');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const data = {
      user,
      account,
      money,
      selectedBank,
      note,
    };
    console.log("data", data);
    await generateQRCode();
  };

  const handleSelectedBank = (selectedOption) => {
    setSelectedBank(selectedOption);
    const key = data.filter(item => item.bin === selectedOption?.value);
    setBankDesc(key[0]);
    
  }

  return (
    <div
      className={`w-full flex justify-center items-center ${
        dataURL ? "h-full" : "h-screen"
      } `}
    >
      <div className="p-10 rounded-[20px] md:border lg:border w-[550px] ">
        <h1 className="text-center mb-6 font-semibold text-[24px] md:text-[28px] lg:text-[28px] bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
          TẠO MÃ QR THANH TOÁN
        </h1>

        <form>
          <input
            className={`p-3 border text-base outline-none rounded-md w-full ${isSubmitted && !user ? 'border-red-500' : ''}`}
            type="text"
            placeholder="Tên người nhận"
            required
            value={user || ""}
            onChange={(e) => setUser(e.target.value.toUpperCase())}
          />
          {isSubmitted && !user && <span className="text-red-500">* Vui lòng nhập tên người nhận</span>}          
          <input
            className={`p-3 border text-base outline-none rounded-md w-full mt-4 ${isSubmitted && !account ? 'border-red-500' : ''}`}
            type="text"
            placeholder="Số tài khoản"
            onChange={(e) => setAccount(e.target.value)}
            required
          />
          {isSubmitted && !account && <span className="text-red-500">* Vui lòng nhập số tài khoản</span>}          

          <Select
            options={data.map((item) => ({
              value: item.bin,
              label: (
                <div className="flex items-center">
                  <img
                    src={item.logo}
                    alt=""
                    className="w-[20px] h-[20px] mr-2"
                  />
                  {item.shortName}
                </div>
              ),
              searchText:
                item.shortName.toLowerCase() + " " + item.bin.toLowerCase(), // Thêm trường này
            }))}
            isSearchable
            filterOption={
              (option, searchText) =>
                option.data.searchText.includes(searchText.toLowerCase())
            }
            onChange={(selectedOption) => handleSelectedBank(selectedOption)}
            value={selectedBank}
            placeholder="Tìm kiếm hoặc chọn ngân hàng"
            className="mt-4"
            classNamePrefix="select"
            classNames={{
              control: (state) => 
                `p-1 text-base ${state.isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''} ${
                  isSubmitted && !selectedBank ? '!border-red-500' : 'border-gray-300'
                }`,
              option: () => "flex items-center p-3",
            }}
          />
          {isSubmitted && !selectedBank && <span className="text-red-500">* Vui lòng chọn ngân hàng</span>}          

          <input
            type="text"
            className="p-3 border text-base outline-none rounded-md w-full my-4"
            value={money ? formatVND(money) : ""}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              setMoney(rawValue === "" ? "" : parseInt(rawValue, 10));
            }}
            placeholder="Nhập số tiền (VNĐ)"
          />
          <input
            className="p-3 border text-base outline-none rounded-md w-full"
            type="text"
            placeholder="Nội dung chuyển khoản"
            value={note || ''}
            onChange={(e) => setNote(e.target.value.toUpperCase())}
            required
          />
          <button
            className="p-3 text-base border-none rounded-md cursor-pointer overflow-hidden mt-4 w-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500"
            type="submit"
            onClick={(e) => handleSubmit(e)}
          >
            Tạo QR
          </button>
        </form>
        {dataURL && (
          <div>
            <img
              src={dataURL}
              alt="QR Code"
              className="mt-10 mx-auto rounded-lg"
            />
            <div className="mt-4 flex px-5">
              <button className="p-3 w-28 text-[14px] md:text-[16px] lg:text-[16px] rounded-md md:w-52 lg:w-52 text-white bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold"
                onClick={downloadQR}
              >Tải xuống</button>
              <button className="p-3 w-28 text-[14px] md:text-[16px] lg:text-[16px] rounded-md md:w-52 lg:w-52 ml-3 text-white bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold" 
                onClick={() => handleCopy(contentCopy)}
              >Sao chép</button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default App;
