import React, { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { gerarPix } from '../services/pixService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pixData: any) => void;
}

interface FormData {
  cpf: string;
  phone: string;
}

interface CPFValidationResult {
  isValid: boolean;
  userData?: {
    name: string;
    email: string;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({ cpf: '', phone: '' });
  const [isValidatingCPF, setIsValidatingCPF] = useState(false);
  const [isGeneratingPIX, setIsGeneratingPIX] = useState(false);
  const [cpfValidation, setCpfValidation] = useState<CPFValidationResult>({ isValid: false });
  const [cpfError, setCpfError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const validateCPF = async (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      setCpfError('CPF deve ter 11 dígitos');
      setCpfValidation({ isValid: false });
      return;
    }

    setIsValidatingCPF(true);
    setCpfError('');

    try {
      const token = '95150b0b9cc3dcb0ae0b24a66514a8360cb293324fb65ffb76f783133018cfc8';
      const response = await fetch(`https://api.dataget.site/api/v1/cpf/${cpfLimpo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      setCpfValidation({ 
        isValid: true, 
        userData: {
          name: data.name || 'Nome não encontrado',
          email: data.email || `${cpfLimpo}@email.com`
        }
      });
      setCpfError('');
    } catch (error) {
      console.error('Erro ao consultar CPF:', error);
      setCpfError('CPF INVÁLIDO. Por favor, verifique os números digitados.');
      setCpfValidation({ isValid: false });
    } finally {
      setIsValidatingCPF(false);
    }
  };

  const validatePhone = (phone: string) => {
    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setPhoneError('Telefone inválido');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const generatePIX = async () => {
    if (!cpfValidation.isValid || !cpfValidation.userData) {
      setCpfError('CPF deve ser validado primeiro');
      return;
    }

    if (!validatePhone(formData.phone)) {
      return;
    }

    setIsGeneratingPIX(true);

    try {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      const cpfNumbers = formData.cpf.replace(/\D/g, '');

      const result = await gerarPix(
        cpfValidation.userData.name,
        cpfValidation.userData.email,
        cpfNumbers,
        phoneNumbers,
        2990, // R$ 29,90 em centavos
        "Combo VIP - 150 Números + Rifa VIP R$5.000 + Grupo VIP"
      );

      onSuccess(result);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      alert(`Erro ao gerar PIX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingPIX(false);
    }
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    
    const cpfNumbers = value.replace(/\D/g, '');
    if (cpfNumbers.length === 11) {
      validateCPF(formatted);
    } else {
      setCpfValidation({ isValid: false });
      setCpfError('');
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (phoneError) {
      validatePhone(formatted);
    }
  };

  const canSubmit = cpfValidation.isValid && formData.phone.length >= 14 && !isValidatingCPF && !isGeneratingPIX;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto border-4 border-yellow-400 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-green-800">Finalizar Compra</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Resumo da Oferta */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">🎯 Combo VIP Ativado!</h3>
          <div className="text-sm space-y-1">
            <p>✅ +150 números extras</p>
            <p>✅ Rifa VIP R$5.000</p>
            <p>✅ Grupo VIP WhatsApp</p>
          </div>
          <div className="mt-3 text-2xl font-bold text-yellow-300">
            Apenas R$ 29,90
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          {/* CPF Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CPF *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-mono transition-colors ${
                  cpfValidation.isValid 
                    ? 'border-green-500 bg-green-50' 
                    : cpfError 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900`}
              />
              {isValidatingCPF && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                </div>
              )}
              {cpfValidation.isValid && !isValidatingCPF && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            {cpfError && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {cpfError}
              </div>
            )}
            {cpfValidation.isValid && cpfValidation.userData && (
              <div className="mt-2 text-green-600 text-sm">
                ✅ CPF válido
              </div>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefone/WhatsApp *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className={`w-full px-4 py-3 border-2 rounded-lg text-lg transition-colors ${
                phoneError 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900`}
            />
            {phoneError && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {phoneError}
              </div>
            )}
          </div>
        </div>

        {/* Botão de Pagamento */}
        <div className="mt-6">
          <button
            onClick={generatePIX}
            disabled={!canSubmit}
            className={`w-full py-4 px-6 rounded-xl text-lg font-bold transition-all duration-300 ${
              canSubmit
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGeneratingPIX ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Gerando PIX...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                💳 GERAR PIX - R$ 29,90
              </div>
            )}
          </button>
        </div>

        {/* Segurança */}
        <div className="mt-4 text-center text-xs text-gray-500">
          🔒 Pagamento 100% seguro • Dados protegidos
        </div>
      </div>
    </div>
  );
};