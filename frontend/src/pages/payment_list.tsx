import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Contract, CONTRACT_STATUS_TYPE_MAP, Infor, Post, Room, User } from '../components/interface_type';
import { getCSRFToken } from '../utils/cookies';
import { useAuthSessionQuery } from '../django-allauth/sessions/hooks';
import {VietQR} from 'vietqr';
interface Bank {
    id: number;
    name: string;
    code: string;
    bin: string;
    isTransfer: number;
    short_name: string;
    logo: string;
    support: number;
}

interface GetBanksResponse {
    code: string;
    desc: string;
    data: Bank[];
}
interface VietQRTemplate {
    name: string;
    template: string;
    demo: string;
}

interface GetTemplatesResponse {
    code: string;
    desc: string;
    data: VietQRTemplate[];
}

interface GenQRCodeResponseData {
    acqId: string;
    accountName: string;
    qrDataURL: string;
}

interface GenQRCodeResponse {
    code: string;
    desc: string;
    data: GenQRCodeResponseData;
}
const csrftoken = getCSRFToken();
let vietQR = new VietQR({
    clientID: '1d9190d9-cacc-42fc-8d22-14928eb2bf99',
    apiKey: '8d68b2b8-abff-4f0b-b419-22f7f9c82de4',
});


const PaymentList: React.FC = () => {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const [user, setUser] = useState<User>();
  const [qrData, setQrData] = useState<GenQRCodeResponseData | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [templates, setTemplates] = useState<VietQRTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('compact');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch templates on mount
  useEffect(() => {
    setTemplateLoading(true);
    vietQR.getTemplate()
      .then((data: GetTemplatesResponse) => {
        setTemplates(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedTemplate(data.data[0].template);
        }
        setTemplateError(null);
      })
      .catch(() => {
        // Nếu lỗi, dùng danh sách template mặc định
        const defaultTemplates: VietQRTemplate[] = [
          {
            name: 'QR Only',
            template: 'qr_only',
            demo: 'https://api.vietqr.io/Vietinbank/113366668888/790000/Gop%20Quy/qr_only.jpg?accountName=Quy%20Vacxin%20Covid'
          },
          {
            name: 'Compact',
            template: 'compact',
            demo: 'https://api.vietqr.io/Vietinbank/113366668888/790000/Gop%20Quy/compact.jpg?accountName=Quy%20Vacxin%20Covid'
          },
          {
            name: 'Compact 2',
            template: 'compact2',
            demo: 'https://api.vietqr.io/Vietinbank/113366668888/790000/Gop%20Quy/compact2.jpg?accountName=Quy%20Vacxin%20Covid'
          }
        ];
        setTemplates(defaultTemplates);
        setSelectedTemplate(defaultTemplates[0].template);
        setTemplateError('Không lấy được danh sách template QR từ API, đang dùng mẫu mặc định.');
      })
      .finally(() => setTemplateLoading(false));
  }, []);

  // Generate QR when user or selectedTemplate changes
  useEffect(() => {
    const fetchAndGenQR = async () => {
      setQrLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, { withCredentials: true, headers: { 'X-CSRFToken': csrftoken || '' } });
        const user: User = res.data;
        setUser(user);
        const accountNumber = user?.infor?.bank_account;
        console.log('accountNumber:', accountNumber);
        const accountName = user?.infor?.bank_name;
        if (!accountNumber || !accountName) {
          setQrData(null);
          setQrLoading(false);
          return;
        }
        const bank = '970423'; // Vietcombank BIN mặc định
        const amount = 79000;
        const memo = 'Thanh toan tien phong';
        const template = selectedTemplate || 'compact';
        const qrRes = await vietQR.genQRCodeBase64({
          bank,
          accountName,
          accountNumber,
          amount: String(amount),
          memo,
          template
        });
        setQrData(qrRes.data);
      } catch (err) {
        setQrData(null);
      } finally {
        setQrLoading(false);
      }
    };
    fetchAndGenQR();
  }, [selectedTemplate]);

  return (
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem] w-[1000px]">
      <h2 className="text-xl font-bold mb-4">Thanh toán bằng QR</h2>
      {templateLoading ? (
        <div>Đang tải template QR...</div>
      ) : templateError ? (
        <div className="text-red-500">{templateError}</div>
      ) : templates.length > 0 && (
        <div className="mb-4">
          <label className="font-semibold mr-2">Chọn mẫu QR:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
          >
            {templates.map(tpl => (
              <option key={tpl.template} value={tpl.template}>{tpl.name}</option>
            ))}
          </select>
          <div className="flex gap-4 mt-2 flex-wrap">
            {templates.map(tpl => (
              <div
                key={tpl.template}
                className={`flex flex-col items-center cursor-pointer ${selectedTemplate === tpl.template ? 'ring-2 ring-blue-500 rounded' : ''}`}
                onClick={() => setSelectedTemplate(tpl.template)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedTemplate === tpl.template}
              >
                <img
                  src={tpl.demo}
                  alt={tpl.name}
                  className="w-24 h-24 border rounded shadow"
                  style={{ objectFit: 'cover' }}
                />
                <span className="text-xs mt-1">{tpl.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {qrLoading ? (
        <div>Đang tạo mã QR...</div>
      ) : !user?.infor?.bank_account || !user?.infor?.bank_name ? (
        <div className="text-red-500">Bạn cần cập nhật đầy đủ thông tin ngân hàng (tên chủ TK, số tài khoản) trong hồ sơ cá nhân để tạo mã QR thanh toán.</div>
      ) : qrData ? (
        <div className="flex flex-col items-center gap-2">
          <img src={qrData.qrDataURL} alt="QR code thanh toán" className="w-64 h-64 border shadow" />
          <div className="text-center mt-2">
            <div className="font-semibold">{qrData.accountName}</div>
            <div className="text-gray-500">Số tài khoản: {qrData.acqId}</div>
            <div className="text-gray-500">Số tiền: 79.000đ</div>
            <div className="text-gray-500">Nội dung: Thanh toan tien phong</div>
          </div>
        </div>
      ) : (
        <div className="text-red-500">Không tạo được mã QR. Vui lòng kiểm tra lại thông tin ngân hàng.</div>
      )}
    </div>
  );
};

export default PaymentList;
