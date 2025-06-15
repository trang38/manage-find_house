import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getCSRFToken } from '../../utils/cookies';
import { useAuthSessionQuery } from '../../django-allauth/sessions/hooks';
import { Rating } from '../interface_type';

const csrftoken = getCSRFToken();
export const ContractReviewSection = ({ contract, isOwner }: { contract: any, isOwner: boolean }) => {
    const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
    const [ratingObj, setRatingObj] = useState<Rating | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [ratingText, setRatingText] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [loading, setLoading] = useState(false);
    const isTenant = contract?.tenant?.id === authData?.user?.id;
    const isLandlord = contract?.landlord?.id === authData?.user?.id;

    // Fetch rating & feedback
    useEffect(() => {
        if (!contract?.id) return;
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_URL}/api/ratings/?contract=${contract.id}`, { withCredentials: true })
            .then(res => {
                const ratings = Array.isArray(res.data) ? res.data : [];
                const myRating = ratings.find((r: any) => r.contract === contract.id);
                setRatingObj(myRating || null);
                setRating(myRating?.rating || 0);
                setRatingText(myRating?.feedback || '');
                setFeedbackText(myRating?.feedback_obj?.feedback || '');
            })
            .catch(err => {
                setRatingObj(null);
                setRating(0);
                setRatingText('');
                setFeedbackText('');
            })
            .finally(() => setLoading(false));
    }, [contract?.id]);

    // Tenant: submit or update rating
    const handleSubmitRating = async () => {
        if (!rating || !ratingText) return;
        setLoading(true);
        try {
            if (ratingObj) {
                // update
                await axios.put(`${process.env.REACT_APP_API_URL}/api/ratings/${ratingObj.id}/`, {
                    contract: contract.id,
                    tenant: contract.tenant.id,
                    rating,
                    feedback: ratingText
                }, {
                    withCredentials: true,
                    headers: { 'X-CSRFToken': csrftoken || '' }
                });
            } else {
                // create
                await axios.post(`${process.env.REACT_APP_API_URL}/api/ratings/`, {
                    contract: contract.id,
                    tenant: contract.tenant.id,
                    rating,
                    feedback: ratingText
                }, {
                    withCredentials: true,
                    headers: { 'X-CSRFToken': csrftoken || '' }
                });
            }
            // refetch
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/ratings/?contract=${contract.id}`, {
                withCredentials: true,
                headers: { 'X-CSRFToken': csrftoken || '' }
            });
            const ratings = Array.isArray(res.data) ? res.data : [];
            const myRating = ratings.find((r: any) => r.contract === contract.id);
            setRatingObj(myRating || null);
            setRating(myRating?.rating || 0);
            setRatingText(myRating?.feedback || '');
            setFeedbackText(myRating?.feedback_obj?.feedback || '');
        } catch (err) {
        }
        setLoading(false);
    };
    // Landlord: submit or update feedback
    const handleSubmitFeedback = async () => {
        if (!feedbackText || !ratingObj) return;
        setLoading(true);
        if (ratingObj.feedback_obj) {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/room-feedbacks/${ratingObj.feedback_obj.id}/`, {
                contract: contract.id,
                landlord: contract.landlord.id,
                feedback: feedbackText,
                response_to_rating: ratingObj.id
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrftoken || '',
                }
            });
        } else {
            try {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/room-feedbacks/`, {
                    contract: contract.id,
                    landlord: contract.landlord.id,
                    feedback: feedbackText,
                    response_to_rating: ratingObj.id
                }, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': csrftoken || '',
                    }
                });
            } catch (err: any) {
                console.log(err.response?.data); // Xem chi tiết lỗi trả về từ backend
            }

        }
        // refetch rating để lấy feedback_obj mới nhất
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/ratings/?contract=${contract.id}`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': csrftoken || '',
            }
        });
        const ratings = res.data;
        const myRating = ratings.find((r: any) => r.contract === contract.id);
        setRatingObj(myRating);
        setFeedbackText(myRating?.feedback_obj?.feedback || '');
        setLoading(false);
    };

    return (
        <div className="border-t pt-8 mt-8 bg-white rounded-lg shadow-md w-full">
            <h2 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
                <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold">
                    Đánh giá & Phản hồi phòng trọ
                </span>
            </h2>
            {loading && <div className="text-center text-gray-500 mb-4">Đang tải...</div>}
            {/* Tenant: tạo/sửa rating */}
            {isTenant && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Đánh giá phòng trọ:</span>
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={star <= rating ? 'text-yellow-400 cursor-pointer text-2xl' : 'text-gray-300 cursor-pointer text-2xl'} onClick={() => setRating(star)}>&#9733;</span>
                        ))}
                    </div>
                    <textarea
                        className="border w-full mt-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                        rows={2}
                        placeholder="Nhận xét về phòng trọ..."
                        value={ratingText}
                        onChange={e => setRatingText(e.target.value)}
                    />
                    <button className="mt-3 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow font-semibold transition" onClick={handleSubmitRating} disabled={loading || !rating || !ratingText}>{ratingObj ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</button>
                </div>
            )}
            {/* Hiển thị rating và feedback */}
            {ratingObj && (
                <div className="mb-6 border rounded-lg p-4 bg-gray-50 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className='flex flex-row items-center gap-2'>
                            <div className="">
                                <img src={process.env.REACT_APP_API_URL + String(contract?.tenant?.infor.image)} alt="" className='w-[2rem] h-[2rem] rounded-full' />
                            </div>
                            <div>
                                <b className="text-blue-800">{contract?.tenant?.infor?.full_name || 'Người thuê'}:</b>
                                <span className="text-yellow-400 text-lg">{'★'.repeat(ratingObj.rating)}{'☆'.repeat(5 - ratingObj.rating)}</span>
                            </div>
                        </div>

                        <span className="ml-auto text-xs text-gray-400 italic">{ratingObj.created_at ? new Date(ratingObj.created_at).toLocaleString('vi-VN') : ''}</span>
                    </div>
                    <div className="ml-2 text-sm italic text-gray-700 mb-2">{ratingObj.feedback}</div>

                    {/* Hiển thị feedback của landlord */}
                    {ratingObj.feedback_obj && (
                        <div className="mt-4 flex items-center gap-2 ml-[3rem]">
                            <div className="">
                                <img src={process.env.REACT_APP_API_URL + String(contract?.landlord?.infor.image)} alt="" className='w-[2rem] h-[2rem] rounded-full' />
                            </div>
                            <div>
                                <div className="text-sm text-blue-700"><b>{contract?.landlord?.infor?.full_name || 'Chủ nhà'}:</b> {ratingObj.feedback_obj.feedback}</div>
                                <div className="text-xs text-gray-400 italic mt-1">{ratingObj.feedback_obj.created_at ? new Date(ratingObj.feedback_obj.created_at).toLocaleString('vi-VN') : ''}</div>
                            </div>
                        </div>
                    )}
                    {/* Landlord: tạo/sửa feedback */}
                    {isLandlord && (
                        <div className="mt-2 bg-blue-100 p-3 rounded-lg ml-[3rem]">
                            <textarea
                                className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                rows={2}
                                placeholder="Phản hồi của chủ nhà..."
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                            />
                            <button className="mt-2 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow font-semibold transition" onClick={handleSubmitFeedback} disabled={loading || !feedbackText}>{ratingObj.feedback_obj ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};