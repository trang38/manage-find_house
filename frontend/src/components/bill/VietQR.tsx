import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Bill, VietQRRequest } from '../interface_type';

interface VietQRComponentProps {
  bill: Bill,
}
const VietQRComponent: React.FC<(VietQRComponentProps)> = ({
    bill,
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchQR = async () => {
      const clientId = '1d9190d9-cacc-42fc-8d22-14928eb2bf99';
      const apiKey = '8d68b2b8-abff-4f0b-b419-22f7f9c82de4';

      const requestData = {
        accountNo: bill?.contract?.data?.landlord_bank_account || '',
        accountName: bill?.contract?.data?.landlord_bank_account_name || '',
        acqId: bill?.contract?.data?.landlord_bank_name || '',
        amount: String(bill?.total_amount) ?? 0,
        addInfo: bill?.content || '',
        template: 'print',
      };

      try {
        const res = await axios.post('https://api.vietqr.io/v2/generate', requestData, {
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        });
        console.log('vietqr:',res);
        setQrUrl(res.data.data.qrDataURL);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQR();
  }, []);

  return (
    <div>
      <h2>QR Code</h2>
      {qrUrl ? <img src={qrUrl} alt="QR Code" /> : <p>Đang tạo mã QR...</p>}
    </div>
  );
};

export default VietQRComponent;