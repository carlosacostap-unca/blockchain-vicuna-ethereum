'use client';

import { useParams } from 'next/navigation';
import NFTTraceability from '../../../components/NFTTraceability';

export default function TrazabilidadPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;

  return (
    <div>
      <NFTTraceability tokenId={tokenId} />
    </div>
  );
}