'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { User, Lock, Trash2, Send, MessageSquare, Heart, CornerDownRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useAuth } from '@/components/auth/AuthProvider';

interface Comment {
    id: number;
    nickname: string;
    content: string;
    gender: 'female' | 'male' | 'unknown';
    likes: number;
    created_at: string;
    replies?: Comment[];
}

interface CommentSectionProps {
    episodeId: string;
}

export function CommentSection({ episodeId }: CommentSectionProps) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    
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
    
    // 대댓글 상태
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [replyNickname, setReplyNickname] = useState('');
    const [replyPassword, setReplyPassword] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyGender, setReplyGender] = useState<'female' | 'male' | 'unknown'>('unknown');
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);

    // 좋아요 중복 방지
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchComments();
        
        // 로그인 상태면 유저 정보로 자동 채움
        if (isLoggedIn && user) {
            const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자';
            const autoPassword = `oauth_${user.id.substring(0, 8)}`;
            setNickname(displayName);
            setPassword(autoPassword);
            setReplyNickname(displayName);
            setReplyPassword(autoPassword);
        } else {
            // 비로그인 시 로컬 저장 닉네임 복원
            const saved = localStorage.getItem('comment_nickname');
            if (saved) { setNickname(saved); setReplyNickname(saved); }
            const savedPw = localStorage.getItem('comment_password');
            if (savedPw) { setPassword(savedPw); setReplyPassword(savedPw); }
            const savedGender = localStorage.getItem('comment_gender') as any;
            if (savedGender) { setGender(savedGender); setReplyGender(savedGender); }
        }
    }, [episodeId, isLoggedIn]);

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
        
        // 비로그인 시에만 닉네임과 비밀번호 필수 검사
        if (!isLoggedIn && (!nickname || !password)) {
            setErrorMsg('닉네임, 비밀번호, 내용을 모두 입력해주세요.');
            return;
        }
        
        if (!content) {
            setErrorMsg('내용을 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            localStorage.setItem('comment_nickname', nickname);
            localStorage.setItem('comment_password', password);
            localStorage.setItem('comment_gender', gender);
            
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId, nickname, password, content, gender }),
            });
            const data = await res.json();
            if (res.ok) {
                setContent('');
                fetchComments();
            } else {
                setErrorMsg(data.error || '댓글 작성 실패');
            }
        } catch (error: any) {
            setErrorMsg(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (parentId: number) => {
        if (!isLoggedIn && (!replyNickname || !replyPassword)) return;
        if (!replyContent) return;
        setIsReplySubmitting(true);
        try {
            localStorage.setItem('comment_nickname', replyNickname);
            localStorage.setItem('comment_password', replyPassword);
            localStorage.setItem('comment_gender', replyGender);
            
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    episodeId,
                    nickname: replyNickname,
                    password: replyPassword,
                    content: replyContent,
                    gender: replyGender,
                    parentId,
                }),
            });
            if (res.ok) {
                setReplyToId(null);
                setReplyContent('');
                fetchComments();
            }
        } catch (error) {
            alert('답글 작성에 실패했습니다.');
        } finally {
            setIsReplySubmitting(false);
        }
    };

    const handleLike = async (commentId: number) => {
        if (likedIds.has(commentId)) return;
        try {
            const res = await fetch('/api/comments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId }),
            });
            if (res.ok) {
                setLikedIds(prev => new Set(prev).add(commentId));
                fetchComments();
            }
        } catch (error) {
            console.error('좋아요 실패:', error);
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
                fetchComments();
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

    const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`group flex gap-3 ${isReply ? 'ml-12 mt-3' : ''} bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] hover:border-pink-100 hover:shadow-md transition-all`}>
            <div className={`flex-shrink-0 ${isReply ? 'w-9 h-9 text-lg' : 'w-12 h-12 text-2xl'} rounded-full flex items-center justify-center bg-gray-50 border border-gray-100`}>
                {comment.gender === 'female' ? '👩' : comment.gender === 'male' ? '👨' : '👻'}
            </div>
            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${comment.gender === 'female' ? 'text-pink-600' : comment.gender === 'male' ? 'text-blue-600' : 'text-gray-700'}`}>
                            {comment.nickname}
                        </span>
                        <span className="text-gray-400 text-xs">
                            {new Date(comment.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <button
                        onClick={() => setDeleteModalCommentId(comment.id)}
                        className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        aria-label="댓글 삭제"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm break-words">{comment.content}</p>
                
                {/* 좋아요 + 답글 버튼 */}
                <div className="flex items-center gap-4 mt-2.5">
                    <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                            likedIds.has(comment.id)
                                ? 'text-pink-500'
                                : 'text-gray-400 hover:text-pink-500'
                        }`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${likedIds.has(comment.id) ? 'fill-pink-500' : ''}`} />
                        {(comment.likes || 0) > 0 && <span>{comment.likes}</span>}
                        {(comment.likes || 0) === 0 && <span>좋아요</span>}
                    </button>
                    {!isReply && (
                        <button
                            onClick={() => {
                                setReplyToId(replyToId === comment.id ? null : comment.id);
                                setReplyNickname(nickname || localStorage.getItem('comment_nickname') || '');
                                setReplyPassword(password || localStorage.getItem('comment_password') || '');
                                setReplyGender(gender);
                            }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 font-medium transition-colors"
                        >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            답글 {comment.replies && comment.replies.length > 0 && `(${comment.replies.length})`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-16 pt-12 border-t border-gray-100">
            <h3 className="text-2xl font-serif text-gray-900 mb-8 flex items-center gap-3">
                <MessageSquare className="text-pink-500" />
                솔직한 의견 나누기 <span className="text-gray-400 text-lg">({totalCount})</span>
            </h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 md:p-8 mb-10 shadow-sm">
                {isLoggedIn && user ? (
                    /* 로그인 상태: 프로필 표시 */
                    <div className="flex items-center gap-3 mb-4 px-1">
                        {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                                {nickname.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <span className="text-sm font-bold text-gray-900">{nickname}</span>
                            <span className="text-xs text-gray-400 ml-2">({user.app_metadata?.provider === 'google' ? '🔷 Google' : '💛 Kakao'})</span>
                        </div>
                    </div>
                ) : (
                    /* 비로그인 상태: 닉네임/비밀번호/성별 입력 */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                )}
                <div className="relative">
                    <textarea
                        placeholder="이 에피소드에 대해 어떻게 생각하시나요? 자유롭게 의견을 남겨주세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-5 min-h-[100px] bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-y text-base"
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
            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-12 text-center text-gray-400 animate-pulse font-medium">댓글을 불러오는 중입니다...</div>
                ) : comments.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-3 opacity-50">💭</div>
                        첫 번째 댓글을 남겨보세요!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id}>
                            {/* 메인 댓글 */}
                            {renderComment(comment)}

                            {/* 대댓글 목록 */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {comment.replies.map((reply) => renderComment(reply, true))}
                                </div>
                            )}

                            {/* 대댓글 입력 폼 */}
                            {replyToId === comment.id && (
                                <div className="ml-12 mt-3 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3 text-sm text-blue-600 font-medium">
                                        <CornerDownRight className="w-4 h-4" />
                                        <span>{comment.nickname}님에게 답글</span>
                                    </div>
                                    {!isLoggedIn && (
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <input
                                                type="text"
                                                placeholder="닉네임"
                                                maxLength={10}
                                                value={replyNickname}
                                                onChange={(e) => setReplyNickname(e.target.value)}
                                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            />
                                            <input
                                                type="password"
                                                placeholder="비밀번호"
                                                value={replyPassword}
                                                onChange={(e) => setReplyPassword(e.target.value)}
                                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            />
                                            <Select value={replyGender} onValueChange={(v: any) => setReplyGender(v)}>
                                                <SelectTrigger className="bg-white border-gray-200 rounded-lg h-full text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unknown">👻</SelectItem>
                                                    <SelectItem value="female">👩</SelectItem>
                                                    <SelectItem value="male">👨</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="답글을 입력하세요..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleReplySubmit(comment.id);
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => handleReplySubmit(comment.id)}
                                            disabled={isReplySubmitting || !replyNickname || !replyPassword || !replyContent}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 h-auto text-sm font-bold"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
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
                                onClick={() => { setDeleteModalCommentId(null); setDeletePassword(''); }}
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
