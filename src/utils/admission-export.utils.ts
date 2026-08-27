import { getAllAdmissions, type AdmissionQuery } from '@/services';
import type { Admission } from '@/types';

const STATUS_LABELS: Record<Admission['statut'], string> = {
  en_attente: 'En attente',
  en_cours_etude: "En cours d'étude",
  accepte: 'Accepté',
  refuse: 'Refusé',
};

async function loadAllAdmissions(query: AdmissionQuery): Promise<Admission[]> {
  const first = await getAllAdmissions({
    ...query,
    page: 1,
    limit: 100,
    sortBy: 'nom',
    sortOrder: 'ASC',
  });
  const admissions = [...first.data];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const result = await getAllAdmissions({
      ...query,
      page,
      limit: 100,
      sortBy: 'nom',
      sortOrder: 'ASC',
    });
    admissions.push(...result.data);
  }
  return admissions;
}

function safeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export async function exportAdmissionsByParcours(
  parcours: string,
  query: Omit<AdmissionQuery, 'page' | 'limit' | 'formation'> = {}
): Promise<number> {
  const admissions = await loadAllAdmissions({ ...query, formation: parcours });
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ESSG';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Candidats', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Référence', key: 'reference', width: 16 },
    { header: 'Nom', key: 'nom', width: 24 },
    { header: 'Prénom(s)', key: 'prenom', width: 28 },
    { header: 'Sexe', key: 'sexe', width: 14 },
    { header: 'Date de naissance', key: 'dateNaissance', width: 18 },
    { header: 'Lieu de naissance', key: 'lieuNaissance', width: 24 },
    { header: 'Nationalité', key: 'nationalite', width: 18 },
    { header: 'Téléphone', key: 'telephone', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Niveau', key: 'niveau', width: 14 },
    { header: 'Mention', key: 'mention', width: 28 },
    { header: 'Parcours', key: 'parcours', width: 45 },
    { header: 'Type de Bac', key: 'bacType', width: 24 },
    { header: 'Série du Bac', key: 'bacSerie', width: 18 },
    { header: 'Catégorie du Bac', key: 'bacCategorie', width: 20 },
    { header: 'N° Bac', key: 'numeroBaccalaureat', width: 22 },
    { header: 'Année du Bac', key: 'bacAnneeObtention', width: 16 },
    { header: "Centre d'examen", key: 'bacCentreExamen', width: 28 },
    { header: 'Ancien établissement', key: 'ancienEtablissement', width: 30 },
    { header: 'N° matricule', key: 'numeroMatricule', width: 20 },
    { header: 'Statut', key: 'statut', width: 20 },
    { header: 'Date de dépôt', key: 'dateDepot', width: 18 },
  ];

  admissions.forEach((admission) => {
    sheet.addRow({
      reference: `ESSG-${admission.id}`,
      nom: admission.nom,
      prenom: admission.prenom,
      sexe: admission.sexe ?? '',
      dateNaissance: admission.dateNaissance
        ? new Date(admission.dateNaissance).toLocaleDateString('fr-FR')
        : '',
      lieuNaissance: admission.lieuNaissance ?? '',
      nationalite: admission.nationalite ?? '',
      telephone: admission.telephone ?? '',
      email: admission.email,
      niveau: admission.niveau,
      mention: admission.mention ?? '',
      parcours: admission.formation || admission.parcours || parcours,
      bacType: admission.bacType ?? '',
      bacSerie: admission.bacSerie?.toUpperCase() ?? '',
      bacCategorie: admission.bacCategorie ?? '',
      numeroBaccalaureat: admission.numeroBaccalaureat ?? '',
      bacAnneeObtention: admission.bacAnneeObtention ?? '',
      bacCentreExamen: admission.bacCentreExamen ?? '',
      ancienEtablissement: admission.ancienEtablissement ?? admission.licenceEtablissement ?? '',
      numeroMatricule: admission.numeroMatricule ?? '',
      statut: STATUS_LABELS[admission.statut],
      dateDepot: new Date(admission.creeLe).toLocaleDateString('fr-FR'),
    });
  });

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF176B55' } };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
  header.height = 24;
  sheet.autoFilter = { from: 'A1', to: `V${Math.max(admissions.length + 1, 2)}` };
  sheet.eachRow((row, index) => {
    if (index > 1 && index % 2 === 1) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7F5' } };
    }
    row.alignment = { vertical: 'middle', wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `admissions-${safeFileName(parcours)}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
  return admissions.length;
}
