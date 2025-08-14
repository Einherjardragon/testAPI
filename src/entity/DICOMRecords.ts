import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Index(["patientId", "studyId", "seriesId"])

@Entity()
export class DICOMRecords {

    @PrimaryGeneratedColumn("increment", { type: 'bigint', unsigned: true })
    _id: number;

    //DICOM major fields
    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    patientId: string;

    @Column({ type: 'varchar', length: 256, width: 256, default: null })
    studyId: string;

    //nullable可為空
    @Column({ type: 'varchar', length: 256, default: 'N/A', nullable: true })
    seriesId: string | null;

    @Column({ type: 'datetime', default: null })
    seriesDate: Date;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    seriesBodyPartType: string;

    /**20210315 newField to OHIF studyList */
    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    SpecificCharacterSet: string;

    @Column({ type: 'datetime', default: null })
    StudyDate: Date;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    StudyTime: string;

    @Column({ type: 'varchar', length: 32, width: 32, default: null })
    Modal: string;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    ReferringPhysicianName: string;

    @Column({ type: 'longtext', default: null })
    RetrieveURL: string;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    BirthDate: string;

    @Column({ type: 'varchar', length: 16, width: 16, default: null })
    Sex: string;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    generatedStudyID: string;

    @Column({ type: 'int', default: null })
    NumberofSeries: number;

    @Column({ type: 'int', default: null })
    NumberInstances: number;

    //system data fields
    @Column({ type: 'smallint', default: null })
    dataSource: number;

    @Column({ type: 'smallint', default: null })
    storeMode: number;

    @Column({ type: 'varchar', length: 512, width: 512, default: null })
    storePath: string;

    //Patient information fields
    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    accNum: string;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    patientName: string;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    patientSex: string;

    @Column({ type: 'tinyint', default: null })
    studyAge: number;

    @Column({ type: 'tinyint', default: null })
    state: number;

    //record: seriesinstanceUID sha1 hash code
    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    map_id: string;

    @Column({ type: 'datetime', default: null })
    upload_time: Date;

    @Column({ type: 'varchar', length: 64, width: 64, default: null })
    group_name: string;

    // 2 完成奇美上傳
    @Column({ type: 'tinyint', default: 0 })
    processStatus: number;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    AET: string;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    postToAET: string;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    filterUser: string;

    @Column({ type: 'longtext', default: null })
    dc_pos: string;

    @Column({ type: 'int', default: 0 })
    nodule_count: number;

    @Column({ type: 'varchar', length: 32, width: 32, default: '0' })
    lung_score: string;

    @Column({ type: 'int', default: 0 })
    cac_risk: number;

    @Column({ type: 'int', default: 0 })
    agatston: number;

    @Column({ type: 'tinyint', default: 0 })
    autosend: number;

    @Column({ type: 'tinyint', default: 0 })
    isCompare: number;

    @Column({ type: 'tinyint', default: 0 })
    isConfirm: number;

    @Column({ type: 'varchar', length: 256, default: '', nullable: true })
    model_name: string | null;

    @Column({ type: 'varchar', length: 256, width: 256, default: '0' })
    token: string;

    @Column({ type: 'varchar', length: 256, width: 256, default: '0' })
    dmi_hash: string;

    @Column({ type: 'longtext', default: null })
    list: string;
}
