import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column } from "typeorm";

@Entity()
export class SysLog {

    @PrimaryGeneratedColumn("increment", { type: 'bigint', unsigned: true })
    _id: number;

    @Column({ type: 'varchar', default: null, length: 26, width: 26, comment: '病歷號碼' })
    acc_id: string;

    @Column({ type: 'mediumtext', default: null })
    content: string;

    @Column({ type: 'tinyint' })
    evtType: number;

    @Column({ type: 'datetime' })
    evtDatetime: Date;

    @Column({ type: 'varchar', default: null, length: 100, width: 100, comment: '病人識別碼' })
    patientId: string;

    @Column({ type: 'varchar', default: null, length: 100, width: 100, comment: '病例號碼' })
    rel_id: string;

}
