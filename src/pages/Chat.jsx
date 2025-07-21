import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Avatar, 
  Alert, 
  Spin, 
  Empty, 
  Row,
  Col, 
  Tag,
  Tooltip,
  App
} from "antd";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "../configs/dayjs";
import styled from "styled-components";
import AIServices from "../services/AIServices";
import { InfoCircleOutlined } from '@ant-design/icons';
import { getJoinedGroups, getOwnerGroups } from "../features/group/groupActions";

const { Text } = Typography;

// Styled components for the chat interface
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 400px;
  max-height: 60vh;
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.$isUser ? '#1677ff' : '#f5f5f5'};
  color: ${props => props.$isUser ? 'white' : 'inherit'};
  position: relative;
  margin-top: ${props => props.$hasHeader ? '30px' : '0'};
`;

const MessageHeader = styled.div`
  position: absolute;
  top: -25px;
  left: ${props => props.$isUser ? 'auto' : '0'};
  right: ${props => props.$isUser ? '0' : 'auto'};
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

const TransactionConfirmation = styled(Card)`
  margin: 16px 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const Chat = () => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const { message } = App.useApp();
  
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [potentialTransaction, setPotentialTransaction] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { ownerGroups, joinedGroups } = useSelector((state) => state.group);

  useEffect(() => {
    dispatch(getOwnerGroups());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getJoinedGroups());
  }, [dispatch]);
  
  // Check if user has access to chat (has groups)
  useEffect(() => {
    const checkAccess = async () => {
      const hasGroups = (user?.groups?.length > 0) || (ownerGroups?.length > 0) || (joinedGroups?.length > 0);
      console.log(user?.groups?.length, ownerGroups?.length, joinedGroups?.length);
      setHasAccess(hasGroups);
      
      if (hasGroups && messages.length === 0) {
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            text: t('welcomeMessage'),
            sender: 'ai',
            timestamp: Date.now()
          }
        ]);
      }
    };
    
    checkAccess();
  }, [user, ownerGroups, joinedGroups, t, messages.length]);

  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage.trim();
    setMessages(prev => [
      ...prev, 
      {
        id: `user-${Date.now()}`,
        text: userMessage,
        sender: 'user',
        timestamp: Date.now()
      }
    ]);
    setInputMessage("");
    setLoading(true);
    
    try {
      const response = await AIServices.sendMessage(userMessage);
      
      setMessages(prev => [
        ...prev, 
        {
          id: `ai-${Date.now()}`,
          text: response,
          sender: 'ai',
          timestamp: Date.now()
        }
      ]);
      
      // Check if the message and response indicate a potential transaction
      const transaction = await AIServices.analyzeMessageForTransaction(userMessage, response);
      
      if (transaction) {
        setPotentialTransaction(transaction);
      }
    } catch (error) {
      message.error(error.message || t('aiError'));
      setMessages(prev => [
        ...prev, 
        {
          id: `error-${Date.now()}`,
          text: error.message || t('aiError'),
          sender: 'error',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddTransaction = async () => {
    try {
      await AIServices.createTransaction(potentialTransaction);
      
      setMessages(prev => [
        ...prev, 
        {
          id: `system-${Date.now()}`,
          text: t('transactionAdded'),
          sender: 'system',
          timestamp: Date.now()
        }
      ]);
      
      message.success(t('transactionSuccess'));
      setPotentialTransaction(null);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleRejectTransaction = () => {
    setMessages(prev => [
      ...prev, 
      {
        id: `system-${Date.now()}`,
        text: t('transactionRejected'),
        sender: 'system',
        timestamp: Date.now()
      }
    ]);
    
    setPotentialTransaction(null);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!hasAccess) {
    return (
      <>
        <Helmet
          title={`${t('chat')} | GST`}
          meta={[{ name: "description", content: t('chatDescription') }]}
        />
        <Card>
          <Empty
            description={t('noChatAccess')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Helmet
        title={`${t('chat')} | GST`}
        meta={[{ name: "description", content: t('chatDescription') }]}
      />
      
      <Card title={t('chat')} className="shadow-hover rounded-2xl">
        <ChatContainer>
          <MessagesContainer>
            {messages.length === 0 ? (
              <Empty description={t('enterMessage')} />
            ) : (
              messages.map((message, index) => {
                const isUser = message.sender === 'user';
                const isFirstInGroup = index === 0 || messages[index - 1].sender !== message.sender;
                
                return (
                  <MessageBubble 
                    key={message.id} 
                    $isUser={isUser}
                    $hasHeader={isFirstInGroup}
                  >
                    {isFirstInGroup && (
                      <MessageHeader $isUser={isUser}>
                        <Avatar 
                          size="small"
                          style={{ 
                            backgroundColor: isUser ? '#1677ff' : '#f5f5f5',
                            color: isUser ? 'white' : '#1677ff'
                          }}
                        >
                          {isUser ? t('you').charAt(0) : 'AI'}
                        </Avatar>
                        <Text strong>{isUser ? t('you') : t('aiAssistant')}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(message.timestamp).format('HH:mm')}
                        </Text>
                      </MessageHeader>
                    )}
                    
                    {message.sender === 'error' ? (
                      <Alert type="error" message={message.text} banner />
                    ) : message.sender === 'system' ? (
                      <Alert type="success" message={message.text} banner />
                    ) : (
                      <Text style={{ color: isUser ? 'white' : 'inherit', whiteSpace: 'pre-line' }}>{message.text}</Text>
                    )}
                  </MessageBubble>
                );
              })
            )}
            
            {potentialTransaction && (
              <TransactionConfirmation 
                title={t('confirmTransaction')}
                extra={
                  <Tag color={potentialTransaction.type === 'income' ? 'green' : 'red'}>
                    {potentialTransaction.type === 'income' ? t('income') : t('expense')}
                  </Tag>
                }
              >
                <p>
                  <Text strong>{t('transactionName')}: </Text>
                  <Text>{potentialTransaction.name}</Text>
                </p>
                <p>
                  <Text strong>{t('amount')}: </Text>
                  <Text type={potentialTransaction.type === 'income' ? 'success' : 'danger'}>
                    {formatAmount(potentialTransaction.amount)}
                  </Text>
                </p>
                <p>
                  <Text strong>{t('category')}: </Text>
                  <Text>{potentialTransaction.category === "uncategorized" ? t('noCategory') : potentialTransaction.categoryName}</Text>
                  {potentialTransaction.category === "uncategorized" && (
                    <Tooltip title={t('noCategoryMatch')}>
                      <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                    </Tooltip>
                  )}
                </p>
                <p>
                  <Text strong>{t('group')}: </Text>
                  <Text>{potentialTransaction.trackerName}</Text>
                </p>
                <p>
                  <Text strong>{t('description')}: </Text>
                  <Text>{potentialTransaction.description}</Text>
                </p>
                
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                  <Col span={24} md={12}>
                    <Button 
                      type="primary" 
                      block
                      onClick={handleAddTransaction}
                    >
                      {t('addThisTransaction')}
                    </Button>
                  </Col>
                  <Col span={24} md={12}>
                    <Button 
                      danger
                      block
                      onClick={handleRejectTransaction}
                    >
                      {t('rejectTransaction')}
                    </Button>
                  </Col>
                </Row>
              </TransactionConfirmation>
            )}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <Spin size="small" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          
          <InputContainer>
            <Input.TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder={t('enterMessage')}
              disabled={loading}
              style={{ flexGrow: 1 }}
            />
            <Button 
              type="primary" 
              onClick={handleSendMessage}
              loading={loading}
              disabled={!inputMessage.trim()}
              icon={<span>→</span>}
            >
              {t('send')}
            </Button>
          </InputContainer>
        </ChatContainer>
      </Card>
    </>
  );
};

export default Chat;