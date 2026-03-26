"use client";
import BalancoPDF from '/Projecto/app/dashboard/relatorios/components/BalancoPDF';
import DRE from '/Projecto/app/dashboard/relatorios/components/DREPDF';

export default function TestePage() {
  return( 
  <div className="p-4">
  <BalancoPDF />
  <DRE />
  </div>
  );
}