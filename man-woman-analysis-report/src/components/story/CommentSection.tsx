'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { User, Lock, Trash2, Send, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface Comment {
    id: number;
    nickname: string;
    content: string;
    gender: 'female' | 'male' | 'unknown';
    created_at: string;
}

interface CommentSectionProps {
    episodeId: string;
}

export function CommentSection({ episodeId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [gender, setGender] = useState<'female' | 'male' | 'unknown'>('unknown');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteModalCommentId, setDeleteModalCommentId] = useState<number | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchComments();
    }, [episodeId]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/comments?episodeId=${episodeId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error('댓글을 불러오지 못했습니다.', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname || !password || !content) {
            setErrorMsg('닉네임, 비밀번호, 내용을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // console.log('[CommentSection] Submitting comment:', { episodeId, nickname, content, gender });
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId, nickname, password, content, gender }),
            });

            const data = await res.json();
            // console.log('[CommentSection] API Response:', { status: res.status, data });

            if (res.ok) {
                setContent('');
                setNickname('');
                setPassword('');
                fetchComments(); // 목록 새로고침
            } else {
                setErrorMsg(data.error || '댓글 작성 실패');
            }
        } catch (error: any) {
            // console.error('[CommentSection] Submit error:', error);
            setErrorMsg(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModalCommentId || !deletePassword) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/comments?id=${deleteModalCommentId}&password=${encodeURIComponent(deletePassword)}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDeleteModalCommentId(null);
                setDeletePassword('');
                fetchComments(); // 목록 새로고침
            } else {
                const data = await res.json();
                alert(data.error || '비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-16 pt-12 border-t border-gray-100">
            <h3 className="text-2xl font-serif text-gray-900 mb-8 flex items-center gap-3">
                <MessageSquare className="text-pink-500" />
                솔직한 의견 나누기 <span className="text-gray-400 text-lg">({comments.length})</span>
            </h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 md:p-8 mb-12 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="닉네임 (최대 10자)"
                            maxLength={10}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="password"
                            placeholder="비밀번호 (삭제시 필요)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                    <div>
                        <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                            <SelectTrigger className="w-full h-full min-h-[46px] bg-white border-gray-200 rounded-xl focus:ring-pink-500">
                                <SelectValue placeholder="성별 선택 (선택)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unknown">공개안함 👻</SelectItem>
                                <SelectItem value="female">여성 👩</SelectItem>
                                <SelectItem value="male">남성 👨</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        placeholder="이 에피소드에 대해 어떻게 생각하시나요? 자유롭게 의견을 남겨주세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-5 min-h-[120px] bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-y text-base"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                        {errorMsg && <span className="text-red-500 text-xs font-bold">{errorMsg}</span>}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 py-2 h-auto text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? '등록 중...' : <><Send className="w-4 h-4" /> 등록</>}
                        </Button>
                    </div>
                </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="py-12 text-center text-gray-400 animate-pulse font-medium">댓글을 불러오는 중입니다...</div>
                ) : comments.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-3 opacity-50">💭</div>
                        첫 번째 댓글을 남겨보세요!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-pink-100 hover:shadow-md transition-all">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gray-50 border border-gray-100">
                                {comment.gender === 'female' ? '👩' : comment.gender === 'male' ? '👨' : '👻'}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${comment.gender === 'female' ? 'text-pink-600' : comment.gender === 'male' ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {comment.nickname}
                                        </span>
                                        <span className="text-gray-400 text-xs font-medium">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setDeleteModalCommentId(comment.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2 -mt-2"
                                        aria-label="댓글 삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 삭제 비밀번호 모달 */}
            {deleteModalCommentId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteModalCommentId(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">댓글 삭제</h4>
                        <p className="text-gray-500 text-sm text-center mb-6">작성 시 입력한 비밀번호를 입력해주세요.</p>

                        <div className="relative mb-6">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none transition-all text-base"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl py-6 hover:bg-gray-50 border-gray-200 text-gray-600"
                                onClick={() => {
                                    setDeleteModalCommentId(null);
                                    setDeletePassword('');
                                }}
                            >
                                취소
                            </Button>
                            <Button
                                className="flex-1 rounded-xl py-6 bg-red-500 hover:bg-red-600 font-bold"
                                disabled={isDeleting || !deletePassword}
                                onClick={handleDelete}
                            >
                                {isDeleting ? '삭제 중...' : '삭제하기'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
