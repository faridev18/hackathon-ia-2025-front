export function ChatMessage({ message, isUser, timestamp }) {
  return (
    <div className={`flex w-full mb-6 items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-blue-500" : "bg-gray-300"
      }`}>
        {isUser ? (
          <span className="text-white text-sm font-medium">O</span>
        ) : (
          <span className="text-gray-600 text-sm font-medium">AI</span>
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative ${
        isUser 
          ? "bg-blue-500 text-white rounded-br-sm" 
          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
      }`}>
        {/* Speech bubble tip */}
        <div className={`absolute -bottom-1 w-3 h-3 overflow-hidden ${
          isUser ? "right-0" : "left-0"
        }`}>
          {isUser ? (
            <div className="w-3 h-3 bg-blue-500 rotate-45 transform origin-bottom-right"></div>
          ) : (
            <div className="w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45 transform origin-bottom-left"></div>
          )}
        </div>
        
        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        
        {/* Timestamp */}
        <div className={`flex items-center justify-end mt-2 ${
          isUser ? "text-blue-100" : "text-gray-500"
        }`}>
          <span className="text-xs opacity-80">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}