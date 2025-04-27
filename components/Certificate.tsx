import { formatDate } from '@/utils/format-date';

interface CertificateProps {
  userName: string;
  company: string;
  date: Date;
  courseName: string;
}

export function Certificate({ userName, company, date, courseName }: CertificateProps) {
  return (
    <div className="relative w-[800px] h-[600px] bg-white p-8 mx-auto">
      {/* Border */}
      <div className="absolute inset-4 border-4 border-gray-300"></div>
      <div className="absolute inset-6 border-2 border-gray-300"></div>

      <div className="relative h-full flex flex-col items-center justify-between py-12">
        {/* Logo Container */}
        <div className="flex justify-center items-center">
          <div className="flex-1 flex justify-end">
            <img 
              src="/assets/sgec.jpeg" 
              alt="Logo de SOGEA SATOM" 
              className="h-24 w-auto object-contain"
            />
          </div>
        </div>

        {/* Certificate Content */}
        <div className="space-y-8 text-center">
          <p className="text-xl text-gray-800">
            La société SGE-C CONGO Certifie que
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {userName.toUpperCase()} de la société {company.toUpperCase()}
          </p>
          <p className="text-xl text-gray-800">
            a réussi à compléter le programme de formation suivant :
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {courseName}
          </h1>
        </div>

        {/* Date */}
        <div className="text-left w-full pl-12">
          <p className="text-lg">
            <span className="font-semibold">Date : </span>
            {formatDate(date)}
          </p>
        </div>
      </div>
    </div>
  );
}