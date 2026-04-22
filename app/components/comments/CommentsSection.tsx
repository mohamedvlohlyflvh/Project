"use client";

import { useMemo, useState } from "react";

type CommentAuthor = {
  id: string;
  name: string | null;
  image: string | null;
};

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor | null;
  replies: CommentItem[];
};

type CommentsSectionProps = {
  postSlug: string;
  initialComments: CommentItem[];
  isSignedIn: boolean;
};

type PendingReplyState = Record<string, boolean>;
type ReplyValuesState = Record<string, string>;
type ReplyErrorsState = Record<string, string>;
type SubmittingState = Record<string, boolean>;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string | null | undefined) {
  const safeName = name?.trim();
  if (!safeName) return "AU";

  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function CommentAvatar({ author }: { author: CommentAuthor | null }) {
  if (author?.image) {
    return (
      <img
        src={author.image}
        alt={author.name || "Comment author"}
        className="h-11 w-11 rounded-full object-cover grayscale"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6e9e6] text-xs font-bold text-[#545f6c]">
      {getInitials(author?.name)}
    </div>
  );
}

function CommentNode({
  comment,
  isSignedIn,
  onReply,
  isReplying,
  replyValue,
  replyError,
  isSubmittingReply,
  onToggleReply,
  onReplyChange,
}: {
  comment: CommentItem;
  isSignedIn: boolean;
  onReply: (parentId: string) => Promise<void>;
  isReplying: boolean;
  replyValue: string;
  replyError?: string;
  isSubmittingReply: boolean;
  onToggleReply: (commentId: string) => void;
  onReplyChange: (commentId: string, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <CommentAvatar author={comment.author} />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h4 className="text-sm font-semibold text-[#2f3331]">
              {comment.author?.name || "Anonymous"}
            </h4>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#5c605d]">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          <p className="max-w-2xl whitespace-pre-wrap text-base leading-8 text-[#5c605d]">
            {comment.content}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => onToggleReply(comment.id)}
              className="text-[10px] uppercase tracking-[0.18em] text-[#545f6c] transition-colors hover:text-[#2f3331]"
            >
              {isReplying ? "Cancel Reply" : "Reply"}
            </button>
          </div>

          {isReplying && (
            <div className="mt-5 border-l border-[#afb3b0]/15 pl-4">
              {isSignedIn ? (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await onReply(comment.id);
                  }}
                  className="space-y-4"
                >
                  <textarea
                    value={replyValue}
                    onChange={(event) =>
                      onReplyChange(comment.id, event.target.value)
                    }
                    placeholder="Write your reply..."
                    className="h-28 w-full resize-none border-b border-[#afb3b0]/30 bg-transparent py-3 text-base text-[#2f3331] outline-none transition-colors placeholder:text-[#5c605d]/70 focus:border-[#545f6c]"
                  />

                  {replyError ? (
                    <p className="text-sm text-red-600">{replyError}</p>
                  ) : null}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReply}
                      className="bg-[#545f6c] px-6 py-2.5 text-[10px] uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-[#485460] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingReply ? "Publishing..." : "Publish Reply"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-sm border border-[#afb3b0]/20 bg-[#f3f4f1] px-4 py-4">
                  <p className="text-sm leading-7 text-[#5c605d]">
                    You need to sign in before replying to a discussion.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 ? (
        <div className="ml-4 border-l border-[#afb3b0]/10 pl-6 md:ml-12">
          <div className="space-y-8">
            {comment.replies.map((reply) => (
              <div key={reply.id}>
                <CommentNode
                  comment={reply}
                  isSignedIn={isSignedIn}
                  onReply={onReply}
                  isReplying={false}
                  replyValue=""
                  replyError={undefined}
                  isSubmittingReply={false}
                  onToggleReply={() => undefined}
                  onReplyChange={() => undefined}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CommentsSection({
  postSlug,
  initialComments,
  isSignedIn,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentValue, setCommentValue] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [openReplies, setOpenReplies] = useState<PendingReplyState>({});
  const [replyValues, setReplyValues] = useState<ReplyValuesState>({});
  const [replyErrors, setReplyErrors] = useState<ReplyErrorsState>({});
  const [replySubmitting, setReplySubmitting] = useState<SubmittingState>({});

  const totalComments = useMemo(() => {
    const countReplies = (items: CommentItem[]): number =>
      items.reduce((total, item) => total + 1 + countReplies(item.replies), 0);

    return countReplies(comments);
  }, [comments]);

  const toggleReply = (commentId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setReplyErrors((prev) => ({
      ...prev,
      [commentId]: "",
    }));
  };

  const setReplyValue = (commentId: string, value: string) => {
    setReplyValues((prev) => ({
      ...prev,
      [commentId]: value,
    }));
    setReplyErrors((prev) => ({
      ...prev,
      [commentId]: "",
    }));
  };

  const submitComment = async (parentId?: string) => {
    const value = parentId ? replyValues[parentId] ?? "" : commentValue;
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      if (parentId) {
        setReplyErrors((prev) => ({
          ...prev,
          [parentId]: "Reply content is required.",
        }));
      } else {
        setCommentError("Comment content is required.");
      }
      return;
    }

    if (trimmedValue.length < 3) {
      if (parentId) {
        setReplyErrors((prev) => ({
          ...prev,
          [parentId]: "Reply should be at least 3 characters.",
        }));
      } else {
        setCommentError("Comment should be at least 3 characters.");
      }
      return;
    }

    if (parentId) {
      setReplySubmitting((prev) => ({
        ...prev,
        [parentId]: true,
      }));
      setReplyErrors((prev) => ({
        ...prev,
        [parentId]: "",
      }));
    } else {
      setIsSubmittingComment(true);
      setCommentError("");
    }

    try {
      const response = await fetch(`/api/post-comments/${postSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedValue,
          parentId: parentId ?? null,
        }),
      });

      const data = (await response.json()) as
        | { comment?: CommentItem; error?: string }
        | undefined;

      if (!response.ok || !data?.comment) {
        const errorMessage =
          data?.error || "Unable to publish your comment right now.";

        if (parentId) {
          setReplyErrors((prev) => ({
            ...prev,
            [parentId]: errorMessage,
          }));
        } else {
          setCommentError(errorMessage);
        }

        return;
      }

      const createdComment = data.comment;

      if (parentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: [...comment.replies, createdComment],
                }
              : comment
          )
        );

        setReplyValues((prev) => ({
          ...prev,
          [parentId]: "",
        }));

        setOpenReplies((prev) => ({
          ...prev,
          [parentId]: false,
        }));
      } else {
        setComments((prev) => [createdComment, ...prev]);
        setCommentValue("");
      }
    } catch {
      if (parentId) {
        setReplyErrors((prev) => ({
          ...prev,
          [parentId]:
            "A network error occurred while publishing your reply. Please try again.",
        }));
      } else {
        setCommentError(
          "A network error occurred while publishing your comment. Please try again."
        );
      }
    } finally {
      if (parentId) {
        setReplySubmitting((prev) => ({
          ...prev,
          [parentId]: false,
        }));
      } else {
        setIsSubmittingComment(false);
      }
    }
  };

  return (
    <section className="mt-24 border-t border-[#afb3b0]/15 pt-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            Reader Exchange
          </p>
          <h3 className="mt-3 text-3xl text-[#2f3331]">
            <span className="font-headline italic">Discussions</span>
          </h3>
        </div>

        <p className="max-w-xl text-sm leading-7 text-[#5c605d]">
          A quiet place for reflections, disagreements, and annotations from the
          margin. {totalComments} contribution{totalComments === 1 ? "" : "s"} so
          far.
        </p>
      </div>

      <div className="mb-14 border border-[#afb3b0]/15 bg-[#f3f4f1] p-6 md:p-8">
        <p className="mb-6 text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
          Join the conversation
        </p>

        {isSignedIn ? (
          <form
            className="space-y-6"
            onSubmit={async (event) => {
              event.preventDefault();
              await submitComment();
            }}
          >
            <textarea
              value={commentValue}
              onChange={(event) => {
                setCommentValue(event.target.value);
                setCommentError("");
              }}
              className="h-36 w-full resize-none border-b border-[#afb3b0]/30 bg-transparent py-4 text-lg text-[#2f3331] outline-none transition-colors placeholder:text-[#5c605d]/70 focus:border-[#545f6c]"
              placeholder="Write your reflection..."
            />

            {commentError ? (
              <p className="text-sm text-red-600">{commentError}</p>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="bg-[#545f6c] px-8 py-3 text-xs uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-[#485460] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingComment ? "Publishing..." : "Publish Thought"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-sm border border-[#afb3b0]/20 bg-white px-4 py-5">
            <p className="text-base leading-8 text-[#5c605d]">
              Sign in to join the discussion and leave a reflection on this essay.
            </p>
          </div>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="border border-[#afb3b0]/15 px-6 py-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            No discussions yet
          </p>
          <p className="mt-4 text-lg leading-8 text-[#5c605d]">
            Be the first to leave a thoughtful note in the margin.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-[#afb3b0]/10 pb-8">
              <CommentNode
                comment={comment}
                isSignedIn={isSignedIn}
                onReply={async (parentId) => {
                  await submitComment(parentId);
                }}
                isReplying={Boolean(openReplies[comment.id])}
                replyValue={replyValues[comment.id] ?? ""}
                replyError={replyErrors[comment.id]}
                isSubmittingReply={Boolean(replySubmitting[comment.id])}
                onToggleReply={toggleReply}
                onReplyChange={setReplyValue}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
