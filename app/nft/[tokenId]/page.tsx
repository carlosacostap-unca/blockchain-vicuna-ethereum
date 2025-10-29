'use client';

import { useParams } from 'next/navigation';
import PublicNFTView from '../../../components/PublicNFTView';

export default function PublicNFTPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;

  return (
    <div>
      <PublicNFTView tokenId={tokenId} />
    </div>
  );
}